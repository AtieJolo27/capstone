from app.database.supabase import supabase


def save_fertilizer_prediction(crop_prediction, fertilizer_prediction, zone_id=None):

    data = {

        "best_crop": crop_prediction["best_crop"],

        "best_fertilizer": fertilizer_prediction["best_fertilizer"],

        "recommendations": fertilizer_prediction["recommendations"],

        "zone_id": zone_id,

    }

    response = (
        supabase
        .table("fertilizer_predictions")
        .insert(data)
        .execute()
    )

    return response