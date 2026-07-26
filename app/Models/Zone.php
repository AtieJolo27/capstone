<?php

namespace App\Models;

use App\Support\Gis\GeoJsonBoundary;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

/**
 * @property int $id
 * @property int $farm_id
 * @property string $name
 * @property string|null $description
 * @property string|null $soil_type
 * @property string|null $current_crop
 * @property float|null $area
 * @property string|null $area_unit
 * @property array<string, mixed>|null $boundary_geojson
 * @property float|null $center_latitude
 * @property float|null $center_longitude
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Farm|null $farm
 * @property-read Collection<int, SensorDevice> $sensorDevices
 */
class Zone extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'zones';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'farm_id',
        'name',
        'description',
        'soil_type',
        'current_crop',
        'area',
        'area_unit',
        'boundary_geojson',
        'center_latitude',
        'center_longitude',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'farm_id' => 'integer',
            'area' => 'float',
            'boundary_geojson' => 'array',
            'center_latitude' => 'float',
            'center_longitude' => 'float',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Prevent invalid boundaries from being saved through Eloquent.
     *
     * The map still validates records at read time so legacy or direct database
     * writes cannot break the rest of the GIS page.
     */
    protected static function booted(): void
    {
        static::saving(static function (self $zone): void {
            if (! $zone->isDirty('boundary_geojson') || GeoJsonBoundary::isValid($zone->boundary_geojson)) {
                return;
            }

            throw ValidationException::withMessages([
                'boundary_geojson' => 'The boundary must be valid GeoJSON Polygon or MultiPolygon geometry.',
            ]);
        });
    }

    /**
     * Get the farm that contains this zone.
     *
     * @return BelongsTo<Farm, $this>
     */
    public function farm(): BelongsTo
    {
        return $this->belongsTo(Farm::class);
    }

    /**
     * Get the sensor devices assigned to this zone.
     *
     * @return HasMany<SensorDevice, $this>
     */
    public function sensorDevices(): HasMany
    {
        return $this->hasMany(SensorDevice::class);
    }
}
