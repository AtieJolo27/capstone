<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ThresholdSetting extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'threshold_settings';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'farm_id',
        'sensor_id',
        'parameter_name',
        'min_value',
        'max_value',
        'warning_minimum',
        'warning_maximum',
        'unit',
        'is_active',
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
            'sensor_id' => 'integer',
            'min_value' => 'float',
            'max_value' => 'float',
            'warning_minimum' => 'float',
            'warning_maximum' => 'float',
            'is_active' => 'boolean',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Get the farm this threshold applies to.
     *
     * @return BelongsTo<Farm, $this>
     */
    public function farm(): BelongsTo
    {
        return $this->belongsTo(Farm::class);
    }

    /**
     * Get the sensor device this threshold applies to.
     *
     * @return BelongsTo<SensorDevice, $this>
     */
    public function sensorDevice(): BelongsTo
    {
        return $this->belongsTo(SensorDevice::class, 'sensor_id');
    }
}
