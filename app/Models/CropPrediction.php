<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CropPrediction extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'crop_predictions';

    /**
     * This table stores a creation time, but does not have an updated_at column.
     */
    public const UPDATED_AT = null;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'soil_moisture',
        'soil_temperature',
        'air_temperature',
        'humidity',
        'ph',
        'nitrogen',
        'phosphorus',
        'potassium',
        'best_crop',
        'recommendations',
        'reading_id',
        'sensor_id',
        'farm_id',
        'confidence_score',
        'alternative_crops',
        'model_name',
        'model_version',
        'prediction_status',
        'reviewed_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'soil_moisture' => 'float',
        'soil_temperature' => 'float',
        'air_temperature' => 'float',
        'humidity' => 'float',
        'ph' => 'float',
        'nitrogen' => 'integer',
        'phosphorus' => 'integer',
        'potassium' => 'integer',
        'recommendations' => 'array',
        'reading_id' => 'integer',
        'sensor_id' => 'integer',
        'farm_id' => 'integer',
        'confidence_score' => 'float',
        'alternative_crops' => 'array',
        'reviewed_at' => 'datetime',
    ];

    /**
     * Get the sensor reading used to produce this prediction.
     *
     * @return BelongsTo<SensorReading, $this>
     */
    public function sensorReading(): BelongsTo
    {
        return $this->belongsTo(SensorReading::class, 'reading_id');
    }

    /**
     * Get the sensor device associated with this prediction.
     *
     * @return BelongsTo<SensorDevice, $this>
     */
    public function sensorDevice(): BelongsTo
    {
        return $this->belongsTo(SensorDevice::class, 'sensor_id');
    }

    /**
     * Get the farm associated with this prediction.
     *
     * @return BelongsTo<Farm, $this>
     */
    public function farm(): BelongsTo
    {
        return $this->belongsTo(Farm::class, 'farm_id');
    }

    /**
     * Get the fertilizer predictions derived from this crop prediction.
     *
     * @return HasMany<FertilizerPrediction, $this>
     */
    public function fertilizerPredictions(): HasMany
    {
        return $this->hasMany(FertilizerPrediction::class, 'crop_prediction_id');
    }
}
