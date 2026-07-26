<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('zones', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('farm_id')
                ->constrained('farms')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->string('name', 150);
            $table->text('description')->nullable();
            $table->string('soil_type', 50)->nullable();
            $table->string('current_crop', 100)->nullable();
            $table->double('area')->nullable();
            $table->string('area_unit', 20)->nullable();
            $table->jsonb('boundary_geojson');
            $table->double('center_latitude')->nullable();
            $table->double('center_longitude')->nullable();
            $table->timestampsTz();

            $table->index('farm_id');
        });

        Schema::table('sensor_devices', function (Blueprint $table): void {
            $table->foreignId('zone_id')
                ->nullable()
                ->constrained('zones')
                ->nullOnDelete();
            $table->index('zone_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sensor_devices', function (Blueprint $table): void {
            $table->dropForeign(['zone_id']);
            $table->dropIndex(['zone_id']);
            $table->dropColumn('zone_id');
        });

        Schema::dropIfExists('zones');
    }
};
