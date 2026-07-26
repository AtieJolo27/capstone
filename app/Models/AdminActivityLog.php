<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdminActivityLog extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'admin_activity_logs';

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
        'admin_id',
        'action',
        'table_name',
        'record_id',
        'description',
        'old_data',
        'new_data',
        'ip_address',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'admin_id' => 'integer',
            'record_id' => 'integer',
            'old_data' => 'array',
            'new_data' => 'array',
            'created_at' => 'datetime',
        ];
    }
}
