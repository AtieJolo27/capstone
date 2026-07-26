export interface PredictionFarmOption {
    id: number;
    farm_name: string;
}

export interface PredictionSensorOption {
    id: number;
    farm_id: number;
    sensor_code: string;
    device_name: string | null;
    farm?: PredictionFarmOption | null;
}

export interface PredictionReadingOption {
    id: number;
    sensor_id: number | null;
    recorded_at: string | null;
    sensor_device?: PredictionSensorOption | null;
}

export interface PredictionCropOption {
    id: number;
    reading_id: number | null;
    sensor_id: number | null;
    farm_id: number | null;
    best_crop: string;
    created_at: string | null;
    sensor_reading?: PredictionReadingOption | null;
    sensor_device?: PredictionSensorOption | null;
    farm?: PredictionFarmOption | null;
}

interface JsonArrayParseResult {
    value: unknown[] | null;
    error: string | null;
}

export const jsonText = (value: unknown, fallback = ''): string => {
    if (value === null || value === undefined) {
        return fallback;
    }

    try {
        return JSON.stringify(value, null, 2) ?? fallback;
    } catch {
        return fallback;
    }
};

export const parseJsonArray = (value: string, fieldName: string, required = false): JsonArrayParseResult => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
        return required
            ? { value: null, error: `${fieldName} is required.` }
            : { value: null, error: null };
    }

    try {
        const parsedValue: unknown = JSON.parse(trimmedValue);

        if (!Array.isArray(parsedValue)) {
            return { value: null, error: `${fieldName} must be a JSON array.` };
        }

        return { value: parsedValue, error: null };
    } catch {
        return { value: null, error: `${fieldName} must contain valid JSON.` };
    }
};

export const nullableValue = (value: string): string | null => (value.trim() === '' ? null : value);

export const dateTimeLocalValue = (value: string | null | undefined): string => {
    if (!value) {
        return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);

    return localDate.toISOString().slice(0, 16);
};
