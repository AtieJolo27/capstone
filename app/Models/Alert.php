<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int|null $farm_id
 * @property int|null $sensor_id
 * @property int|null $reading_id
 * @property string|null $alert_type
 * @property string|null $severity
 * @property string|null $title
 * @property string|null $message
 * @property string|null $parameter_name
 * @property float|null $parameter_value
 * @property float|null $threshold_value
 * @property string|null $status
 * @property Carbon|null $acknowledged_at
 * @property Carbon|null $resolved_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class Alert extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'alerts';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'farm_id',
        'sensor_id',
        'reading_id',
        'alert_type',
        'severity',
        'title',
        'message',
        'parameter_name',
        'parameter_value',
        'threshold_value',
        'status',
        'acknowledged_at',
        'resolved_at',
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
            'reading_id' => 'integer',
            'parameter_value' => 'float',
            'threshold_value' => 'float',
            'acknowledged_at' => 'datetime',
            'resolved_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Get the farm associated with this alert.
     *
     * @return BelongsTo<Farm, $this>
     */
    public function farm(): BelongsTo
    {
        return $this->belongsTo(Farm::class);
    }

    /**
     * Get the sensor device associated with this alert.
     *
     * @return BelongsTo<SensorDevice, $this>
     */
    public function sensorDevice(): BelongsTo
    {
        return $this->belongsTo(SensorDevice::class, 'sensor_id');
    }

    /**
     * Get the sensor reading associated with this alert.
     *
     * @return BelongsTo<SensorReading, $this>
     */
    public function sensorReading(): BelongsTo
    {
        return $this->belongsTo(SensorReading::class, 'reading_id');
    }
}
