export interface Farm {
    id: number;
    farmer_id: string | null;
    farm_name: string;
    description: string | null;
    address: string | null;
    barangay: string | null;
    municipality: string | null;
    province: string | null;
    latitude: number;
    longitude: number;
    farm_size: number | null;
    farm_size_unit: string | null;
    soil_type: string | null;
    current_crop: string | null;
    irrigation_type: string | null;
    status: string | null;
    created_at: string | null;
    updated_at: string | null;
    sensor_devices?: SensorDevice[];
    sensor_devices_count?: number;
    alerts_count?: number;
    crop_predictions_count?: number;
    fertilizer_predictions_count?: number;
    crop_predictions?: CropPrediction[];
    fertilizer_predictions?: FertilizerPrediction[];
    alerts?: Alert[];
    threshold_settings?: ThresholdSetting[];
}

export interface SensorDevice {
    id: number;
    farm_id: number;
    zone_id: number | null;
    sensor_code: string;
    device_name: string | null;
    device_model: string | null;
    serial_number: string | null;
    latitude: number | null;
    longitude: number | null;
    battery_level: number | null;
    signal_strength: number | null;
    firmware_version: string | null;
    connection_type: string | null;
    status: string;
    installation_status: string;
    is_active: boolean;
    installed_at: string | null;
    last_seen_at: string | null;
    created_at: string;
    updated_at: string;
    farm?: Farm;
    sensor_readings?: SensorReading[];
    sensor_readings_count?: number;
    alerts_count?: number;
    crop_predictions_count?: number;
    fertilizer_predictions_count?: number;
    crop_predictions?: CropPrediction[];
    fertilizer_predictions?: FertilizerPrediction[];
    alerts?: Alert[];
    threshold_settings?: ThresholdSetting[];
}

export interface SensorReading {
    id: number;
    sensor_id: number | null;
    soil_moisture: number | null;
    soil_temperature: number | null;
    air_temperature: number | null;
    humidity: number | null;
    ph: number | null;
    nitrogen: number | null;
    phosphorus: number | null;
    potassium: number | null;
    reading_status: string;
    data_source: string;
    is_valid: boolean;
    validation_notes: string | null;
    recorded_at: string;
    created_at: string | null;
    sensor_device?: SensorDevice | null;
    crop_predictions?: CropPrediction[];
    fertilizer_predictions?: FertilizerPrediction[];
    alerts?: Alert[];
    alerts_count?: number;
    crop_predictions_count?: number;
    fertilizer_predictions_count?: number;
}

export interface CropPrediction {
    id: number;
    soil_moisture: number | null;
    soil_temperature: number | null;
    air_temperature: number | null;
    humidity: number | null;
    ph: number | null;
    nitrogen: number | null;
    phosphorus: number | null;
    potassium: number | null;
    best_crop: string;
    recommendations: string[] | Record<string, unknown>;
    reading_id: number | null;
    sensor_id: number | null;
    farm_id: number | null;
    confidence_score: number | null;
    alternative_crops: string[] | Record<string, unknown> | null;
    model_name: string | null;
    model_version: string | null;
    prediction_status: string;
    reviewed_at: string | null;
    created_at: string | null;
    sensor_reading?: SensorReading | null;
    sensor_device?: SensorDevice | null;
    farm?: Farm | null;
    fertilizer_predictions?: FertilizerPrediction[];
}

export interface FertilizerPrediction {
    id: number;
    best_crop: string | null;
    best_fertilizer: string | null;
    recommendations: string[] | Record<string, unknown> | null;
    crop_prediction_id: number | null;
    reading_id: number | null;
    sensor_id: number | null;
    farm_id: number | null;
    application_rate: number | null;
    application_unit: string | null;
    confidence_score: number | null;
    alternative_fertilizers: string[] | Record<string, unknown> | null;
    model_name: string | null;
    model_version: string | null;
    prediction_status: string;
    reviewed_at: string | null;
    created_at: string | null;
    crop_prediction?: CropPrediction | null;
    sensor_reading?: SensorReading | null;
    sensor_device?: SensorDevice | null;
    farm?: Farm | null;
}

export interface Alert {
    id: number;
    farm_id: number | null;
    sensor_id: number | null;
    reading_id: number | null;
    alert_type: string;
    severity: string;
    title: string;
    message: string;
    parameter_name: string | null;
    parameter_value: number | null;
    threshold_value: number | null;
    status: string;
    acknowledged_at: string | null;
    resolved_at: string | null;
    created_at: string;
    updated_at: string;
    farm?: Farm | null;
    sensor_device?: SensorDevice | null;
    sensor_reading?: SensorReading | null;
}

export interface ThresholdSetting {
    id: number;
    farm_id: number | null;
    sensor_id: number | null;
    parameter_name: string;
    min_value: number | null;
    max_value: number | null;
    warning_minimum: number | null;
    warning_maximum: number | null;
    unit: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    farm?: Farm | null;
    sensor_device?: SensorDevice | null;
}

export interface Announcement {
    id: number;
    title: string;
    message: string;
    audience: string;
    priority: string;
    status: string;
    published_at: string | null;
    expires_at: string | null;
    created_by: number | null;
    created_at: string;
    updated_at: string;
}

export interface Report {
    id: number;
    title: string;
    report_type: string;
    description: string | null;
    generated_by: number | null;
    file_name: string | null;
    file_url: string | null;
    file_size: number | null;
    start_date: string | null;
    end_date: string | null;
    generated_at: string;
    created_at: string;
}

export interface SelectOption {
    value: number;
    label: string;
}
