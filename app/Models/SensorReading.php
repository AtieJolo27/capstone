<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int|null $sensor_id
 * @property float|null $soil_moisture
 * @property float|null $soil_temperature
 * @property float|null $air_temperature
 * @property float|null $humidity
 * @property float|null $ph
 * @property int|null $nitrogen
 * @property int|null $phosphorus
 * @property int|null $potassium
 * @property string|null $reading_status
 * @property string|null $data_source
 * @property bool $is_valid
 * @property string|null $validation_notes
 * @property Carbon|null $recorded_at
 * @property Carbon|null $created_at
 */
class SensorReading extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'sensor_readings';

    /**
     * This table has a created_at column but no updated_at column.
     */
    public const UPDATED_AT = null;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'sensor_id',
        'soil_moisture',
        'soil_temperature',
        'air_temperature',
        'humidity',
        'ph',
        'nitrogen',
        'phosphorus',
        'potassium',
        'reading_status',
        'data_source',
        'is_valid',
        'validation_notes',
        'recorded_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'sensor_id' => 'integer',
            'soil_moisture' => 'float',
            'soil_temperature' => 'float',
            'air_temperature' => 'float',
            'humidity' => 'float',
            'ph' => 'float',
            'nitrogen' => 'integer',
            'phosphorus' => 'integer',
            'potassium' => 'integer',
            'is_valid' => 'boolean',
            'recorded_at' => 'datetime',
            'created_at' => 'datetime',
        ];
    }

    /**
     * Get the device that reported this reading.
     *
     * @return BelongsTo<SensorDevice, $this>
     */
    public function sensorDevice(): BelongsTo
    {
        return $this->belongsTo(SensorDevice::class, 'sensor_id');
    }

    /**
     * Get crop predictions generated from this reading.
     *
     * @return HasMany<CropPrediction, $this>
     */
    public function cropPredictions(): HasMany
    {
        return $this->hasMany(CropPrediction::class, 'reading_id');
    }

    /**
     * Get fertilizer predictions associated with this reading.
     *
     * @return HasMany<FertilizerPrediction, $this>
     */
    public function fertilizerPredictions(): HasMany
    {
        return $this->hasMany(FertilizerPrediction::class, 'reading_id');
    }

    /**
     * Get alerts raised from this reading.
     *
     * @return HasMany<Alert, $this>
     */
    public function alerts(): HasMany
    {
        return $this->hasMany(Alert::class, 'reading_id');
    }
}
