<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'reports';

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
        'title',
        'report_type',
        'description',
        'generated_by',
        'file_name',
        'file_url',
        'file_size',
        'start_date',
        'end_date',
        'generated_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'generated_by' => 'integer',
            'file_size' => 'integer',
            'start_date' => 'date',
            'end_date' => 'date',
            'generated_at' => 'datetime',
            'created_at' => 'datetime',
        ];
    }
}
