<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string|null $farmer_id
 * @property string $farm_name
 * @property string|null $description
 * @property string|null $address
 * @property string|null $barangay
 * @property string|null $municipality
 * @property string|null $province
 * @property float $latitude
 * @property float $longitude
 * @property float|null $farm_size
 * @property string|null $farm_size_unit
 * @property string|null $soil_type
 * @property string|null $current_crop
 * @property string|null $irrigation_type
 * @property string|null $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class Farm extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'farms';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'farmer_id',
        'farm_name',
        'description',
        'address',
        'barangay',
        'municipality',
        'province',
        'latitude',
        'longitude',
        'farm_size',
        'farm_size_unit',
        'soil_type',
        'current_crop',
        'irrigation_type',
        'status',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'farmer_id' => 'string',
            'latitude' => 'float',
            'longitude' => 'float',
            'farm_size' => 'float',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Get the sensor devices installed on this farm.
     *
     * @return HasMany<SensorDevice, $this>
     */
    public function sensorDevices(): HasMany
    {
        return $this->hasMany(SensorDevice::class);
    }

    /**
     * Get the field zones that belong to this farm.
     *
     * @return HasMany<Zone, $this>
     */
    public function zones(): HasMany
    {
        return $this->hasMany(Zone::class);
    }

    /**
     * Get crop predictions associated with this farm.
     *
     * @return HasMany<CropPrediction, $this>
     */
    public function cropPredictions(): HasMany
    {
        return $this->hasMany(CropPrediction::class);
    }

    /**
     * Get fertilizer predictions associated with this farm.
     *
     * @return HasMany<FertilizerPrediction, $this>
     */
    public function fertilizerPredictions(): HasMany
    {
        return $this->hasMany(FertilizerPrediction::class);
    }

    /**
     * Get alerts raised for this farm.
     *
     * @return HasMany<Alert, $this>
     */
    public function alerts(): HasMany
    {
        return $this->hasMany(Alert::class);
    }

    /**
     * Get thresholds configured for this farm.
     *
     * @return HasMany<ThresholdSetting, $this>
     */
    public function thresholdSettings(): HasMany
    {
        return $this->hasMany(ThresholdSetting::class);
    }
}
