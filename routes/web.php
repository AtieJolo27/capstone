<?php

use App\Http\Controllers\AlertController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\CropPredictionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FarmController;
use App\Http\Controllers\FertilizerPredictionController;
use App\Http\Controllers\GISController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SensorDeviceController;
use App\Http\Controllers\SensorReadingController;
use App\Http\Controllers\ThresholdSettingController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('guest')->group(function (): void {
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store'])
        ->middleware('throttle:5,1')
        ->name('login.store');
});

Route::middleware('auth')->group(function (): void {
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

    Route::get('/', DashboardController::class)->name('dashboard');

    Route::get('/gis-map-view', GISController::class)->name('gis-map-view');

    Route::get('/farmers', function () {
        return Inertia::render('FarmerManagement');
    })->name('farmers.index');

    Route::redirect('/farmlands', '/farms');

    Route::resource('farms', FarmController::class);
    Route::resource('sensors', SensorDeviceController::class)
        ->parameters(['sensors' => 'sensor']);
    Route::resource('sensor-readings', SensorReadingController::class)
        ->parameters(['sensor-readings' => 'sensorReading']);
    Route::resource('crop-predictions', CropPredictionController::class)
        ->parameters(['crop-predictions' => 'cropPrediction']);
    Route::resource('fertilizer-predictions', FertilizerPredictionController::class)
        ->parameters(['fertilizer-predictions' => 'fertilizerPrediction']);
    Route::resource('alerts', AlertController::class);
    Route::resource('threshold-settings', ThresholdSettingController::class)
        ->parameters(['threshold-settings' => 'thresholdSetting']);
    Route::resource('announcements', AnnouncementController::class);
    Route::resource('reports', ReportController::class);

    Route::redirect('/health-monitor', '/sensors');
    Route::redirect('/historical-data', '/historical-analytics');

    Route::get('/historical-analytics', function () {
        return Inertia::render('HistoricalAnalytics');
    })->name('historical-analytics');

    Route::get('/calibration', function () {
        return Inertia::render('Calibration');
    })->name('calibration');

    Route::get('/settings', function () {
        return Inertia::render('Settings');
    })->name('settings');
});
