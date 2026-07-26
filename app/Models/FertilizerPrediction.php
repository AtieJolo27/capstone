<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FertilizerPrediction extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'fertilizer_predictions';

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
        'best_crop',
        'best_fertilizer',
        'recommendations',
        'crop_prediction_id',
        'reading_id',
        'sensor_id',
        'farm_id',
        'application_rate',
        'application_unit',
        'confidence_score',
        'alternative_fertilizers',
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
        'recommendations' => 'array',
        'crop_prediction_id' => 'integer',
        'reading_id' => 'integer',
        'sensor_id' => 'integer',
        'farm_id' => 'integer',
        'application_rate' => 'float',
        'confidence_score' => 'float',
        'alternative_fertilizers' => 'array',
        'reviewed_at' => 'datetime',
    ];

    /**
     * Get the crop prediction this fertilizer recommendation is based on.
     *
     * @return BelongsTo<CropPrediction, $this>
     */
    public function cropPrediction(): BelongsTo
    {
        return $this->belongsTo(CropPrediction::class, 'crop_prediction_id');
    }

    /**
     * Get the sensor reading associated with this prediction.
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
}
