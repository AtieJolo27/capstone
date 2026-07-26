<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $farm_id
 * @property int|null $zone_id
 * @property string $sensor_code
 * @property string|null $device_name
 * @property string|null $device_model
 * @property string|null $serial_number
 * @property float|null $latitude
 * @property float|null $longitude
 * @property float|null $battery_level
 * @property int|null $signal_strength
 * @property string|null $firmware_version
 * @property string|null $connection_type
 * @property string|null $status
 * @property string|null $installation_status
 * @property bool $is_active
 * @property Carbon|null $installed_at
 * @property Carbon|null $last_seen_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Zone|null $zone
 * @property-read SensorReading|null $latestReading
 * @property-read Collection<int, Alert> $unresolvedAlerts
 */
class SensorDevice extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'sensor_devices';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'farm_id',
        'zone_id',
        'sensor_code',
        'device_name',
        'device_model',
        'serial_number',
        'latitude',
        'longitude',
        'battery_level',
        'signal_strength',
        'firmware_version',
        'connection_type',
        'status',
        'installation_status',
        'is_active',
        'installed_at',
        'last_seen_at',
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
            'zone_id' => 'integer',
            'latitude' => 'float',
            'longitude' => 'float',
            'battery_level' => 'float',
            'signal_strength' => 'integer',
            'is_active' => 'boolean',
            'installed_at' => 'datetime',
            'last_seen_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Get the farm where this sensor device is installed.
     *
     * @return BelongsTo<Farm, $this>
     */
    public function farm(): BelongsTo
    {
        return $this->belongsTo(Farm::class);
    }

    /**
     * Get the field zone where this sensor is deployed.
     *
     * @return BelongsTo<Zone, $this>
     */
    public function zone(): BelongsTo
    {
        return $this->belongsTo(Zone::class);
    }

    /**
     * Get the readings reported by this device.
     *
     * @return HasMany<SensorReading, $this>
     */
    public function sensorReadings(): HasMany
    {
        return $this->hasMany(SensorReading::class, 'sensor_id');
    }

    /**
     * Get the most recent sensor reading without loading historical telemetry.
     *
     * @return HasOne<SensorReading, $this>
     */
    public function latestReading(): HasOne
    {
        return $this->hasOne(SensorReading::class, 'sensor_id')->latestOfMany('recorded_at');
    }

    /**
     * Get crop predictions associated with this device.
     *
     * @return HasMany<CropPrediction, $this>
     */
    public function cropPredictions(): HasMany
    {
        return $this->hasMany(CropPrediction::class, 'sensor_id');
    }

    /**
     * Get fertilizer predictions associated with this device.
     *
     * @return HasMany<FertilizerPrediction, $this>
     */
    public function fertilizerPredictions(): HasMany
    {
        return $this->hasMany(FertilizerPrediction::class, 'sensor_id');
    }

    /**
     * Get alerts raised for this device.
     *
     * @return HasMany<Alert, $this>
     */
    public function alerts(): HasMany
    {
        return $this->hasMany(Alert::class, 'sensor_id');
    }

    /**
     * Get alerts that still require a response.
     *
     * @return HasMany<Alert, $this>
     */
    public function unresolvedAlerts(): HasMany
    {
        return $this->alerts()->where(static function ($query): void {
            $query
                ->whereNull('status')
                ->orWhereNotIn('status', ['resolved', 'dismissed']);
        });
    }

    /**
     * Get threshold settings configured for this device.
     *
     * @return HasMany<ThresholdSetting, $this>
     */
    public function thresholdSettings(): HasMany
    {
        return $this->hasMany(ThresholdSetting::class, 'sensor_id');
    }
}
