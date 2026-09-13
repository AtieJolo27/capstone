import json
import joblib
import numpy as np

MODEL_PATH = "app/machine_learning/models/crop_model.pkl"
SOIL_TYPE_CROPS_PATH = "app/machine_learning/datasets/soil_type_crops.json"


def load_model():
    return joblib.load(MODEL_PATH)


def load_soil_type_crops():
    with open(SOIL_TYPE_CROPS_PATH) as f:
        return json.load(f)


_SOIL_TYPE_CROPS = load_soil_type_crops()


def predict_crop(sensor_data, soil_type=None):
    model = load_model()

    features = np.array([[
        sensor_data["soil_moisture"],
        sensor_data["soil_temperature"],
        sensor_data["air_temperature"],
        sensor_data["humidity"],
        sensor_data["ph"],
        sensor_data["nitrogen"],
        sensor_data["phosphorus"],
        sensor_data["potassium"]
]])

    probabilities = model.predict_proba(features)[0]
    classes = model.classes_

    recommendations = []

    for crop, probability in zip(classes, probabilities):
        recommendations.append({
            "crop": crop,
            "confidence": round(probability * 100, 2)
        })

    recommendations.sort(
        key=lambda x: x["confidence"],
        reverse=True
    )

    # =====================================================
    # FILTER BY SOIL TYPE
    #
    # If a soil_type is provided and recognized, only keep
    # crops that are actually suited to that soil type in our
    # dataset. Falls back to the unfiltered list if the soil
    # type is unknown, or if (edge case) none of the model's
    # candidate crops happen to match that soil type.
    # =====================================================

    soil_type_matched = False

    if soil_type and soil_type in _SOIL_TYPE_CROPS:

        valid_crops = set(_SOIL_TYPE_CROPS[soil_type])

        filtered = [
            r for r in recommendations
            if r["crop"] in valid_crops
        ]

        if filtered:
            recommendations = filtered
            soil_type_matched = True

    return {
    "best_crop": recommendations[0]["crop"],
    "best_confidence": recommendations[0]["confidence"],
    "recommendations": recommendations[:5],
    "soil_type_filtered": soil_type_matched
}