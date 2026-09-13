from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.services.sensor_service import save_sensor_data
from app.utils.sensor_generator import generate_sensor_data
from app.database.supabase import supabase

from app.machine_learning.predict import predict_crop
from app.machine_learning.predict_fertilizer import predict_fertilizer

from app.services.prediction_service import save_prediction
from app.services.fertilizer_service import save_fertilizer_prediction
from app.services.history_service import get_prediction_history


app = FastAPI()


# Single-sensor setup for now - all zone/soil-type settings are stored
# under this fixed device id.
DEVICE_ID = "esp32-1"


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():
    return {
        "message": "Soil Health Monitoring API is running"
    }


# =========================================================
# ZONE / SOIL TYPE SETTINGS
#
# The farmer sets the soil type for the active zone from the
# app's "Add Zone" flow. This is stored in Supabase and looked
# up every time a real sensor reading comes in, so crop and
# fertilizer recommendations only consider crops suited to that
# soil type.
# =========================================================

class SoilTypeInput(BaseModel):
    soil_type: str


@app.post("/device/soil-type")
def set_soil_type(data: SoilTypeInput):

    try:
        supabase.table("device_settings").upsert({
            "device_id": DEVICE_ID,
            "soil_type": data.soil_type,
        }).execute()

    except Exception as e:
        print("ERROR SAVING SOIL TYPE:")
        print(e)
        return {"status": "error", "message": str(e)}

    return {"status": "success", "soil_type": data.soil_type}


@app.get("/device/soil-type")
def get_soil_type():

    try:
        response = (
            supabase
            .table("device_settings")
            .select("soil_type")
            .eq("device_id", DEVICE_ID)
            .execute()
        )

        if response.data:
            return {"soil_type": response.data[0]["soil_type"]}

    except Exception as e:
        print("ERROR READING SOIL TYPE:")
        print(e)

    return {"soil_type": None}


# =========================================================
# DUMMY SENSOR
# =========================================================

@app.post("/sensor")
def create_sensor():

    sensor = generate_sensor_data()

    save_sensor_data(sensor)

    return {
        "message": "Sensor saved successfully",
        "data": sensor
    }


# =========================================================
# GET SENSOR HISTORY
# =========================================================

@app.get("/sensor")
def get_sensors():

    response = (
        supabase
        .table("sensor_readings")
        .select("*")
        .order("id", desc=True)
        .execute()
    )

    return {
        "count": len(response.data),
        "data": response.data
    }


# =========================================================
# PREDICTION INPUT
# =========================================================

class SensorInput(BaseModel):

    soil_moisture: float
    soil_temperature: float
    air_temperature: float
    humidity: float
    ph: float
    nitrogen: int
    phosphorus: int
    potassium: int
    soil_type: str | None = None


# =========================================================
# CROP + FERTILIZER PREDICTION
# =========================================================

@app.post("/predict")
def predict(sensor: SensorInput):

    sensor_data = sensor.model_dump()

    soil_type = sensor_data.pop("soil_type", None)


    crop_prediction = predict_crop(
        sensor_data,
        soil_type=soil_type
    )


    fertilizer_prediction = predict_fertilizer(
        sensor_data,
        crop_prediction["best_crop"]
    )


    save_prediction(
        sensor_data,
        crop_prediction
    )


    save_fertilizer_prediction(
        crop_prediction,
        fertilizer_prediction
    )


    return {
        "crop": crop_prediction,
        "fertilizer": fertilizer_prediction
    }


# =========================================================
# PREDICTION HISTORY
# =========================================================

@app.get("/predictions")
def prediction_history():

    history = get_prediction_history()

    return {
        "count": len(history),
        "data": history
    }


# =========================================================
# REAL ESP32 SENSOR DATA
# =========================================================

class RealSensorData(BaseModel):

    temperature: float
    humidity: float
    conductivity: float
    ph: float

    nitrogen: float
    phosphorus: float
    potassium: float


# =========================================================
# RECEIVE REAL SENSOR
# =========================================================

@app.post("/sensor/realtime")
def receive_realtime_sensor(
    data: RealSensorData
):

    print()
    print("==============================================")
    print("REAL ESP32 SENSOR DATA")
    print("==============================================")

    print(
        f"Temperature  : {data.temperature:.1f} °C"
    )

    print(
        f"Humidity     : {data.humidity:.1f} %"
    )

    print(
        f"Conductivity : {data.conductivity:.0f}"
    )

    print(
        f"pH           : {data.ph:.1f}"
    )

    print(
        f"Nitrogen     : {data.nitrogen:.0f}"
    )

    print(
        f"Phosphorus   : {data.phosphorus:.0f}"
    )

    print(
        f"Potassium    : {data.potassium:.0f}"
    )

    print("==============================================")


    # =====================================================
    # SAVE REAL SENSOR DATA TO SUPABASE
    #
    # Your existing sensor_readings table expects:
    #
    # soil_moisture
    # soil_temperature
    # air_temperature
    # humidity
    # ph
    # nitrogen
    # phosphorus
    # potassium
    #
    # The real sensor gives:
    #
    # temperature
    # humidity
    # conductivity
    # ph
    # nitrogen
    # phosphorus
    # potassium
    #
    # Therefore:
    #
    # temperature -> soil_temperature
    #
    # There is no separate real-time air-temperature reading,
    # so we use the sensor temperature for air_temperature too.
    #
    # There is no soil-moisture field from the sensor payload
    # being sent here, so we use humidity as the moisture value.
    # =====================================================

    sensor_record = {

        "soil_moisture": data.humidity,

        "soil_temperature": data.temperature,

        "air_temperature": data.temperature,

        "humidity": data.humidity,

        "ph": data.ph,

        "nitrogen": int(data.nitrogen),

        "phosphorus": int(data.phosphorus),

        "potassium": int(data.potassium),
    }


    try:

        response = (
            supabase
            .table("sensor_readings")
            .insert(sensor_record)
            .execute()
        )


        print(
            "REAL SENSOR DATA SAVED TO SUPABASE"
        )


    except Exception as e:

        print(
            "ERROR SAVING REAL SENSOR DATA:"
        )

        print(e)


    # =====================================================
    # RUN CROP + FERTILIZER PREDICTION FOR THIS READING
    #
    # sensor_record already has the exact same shape as
    # SensorInput (used by the manual /predict endpoint),
    # so we can feed it straight into predict_crop /
    # predict_fertilizer here. This makes crop_predictions
    # and fertilizer_predictions in Supabase update on every
    # real sensor reading, instead of only when /predict is
    # called manually.
    # =====================================================

    crop_prediction = None
    fertilizer_prediction = None

    try:

        # Look up the farmer's currently set soil type for this
        # device, so crop recommendations only consider crops
        # suited to that soil type.
        current_soil_type = None

        try:
            soil_type_response = (
                supabase
                .table("device_settings")
                .select("soil_type")
                .eq("device_id", DEVICE_ID)
                .execute()
            )

            if soil_type_response.data:
                current_soil_type = soil_type_response.data[0]["soil_type"]

        except Exception as e:
            print("ERROR READING SOIL TYPE (continuing without filter):")
            print(e)

        crop_prediction = predict_crop(
            sensor_record,
            soil_type=current_soil_type
        )

        save_prediction(
            sensor_record,
            crop_prediction
        )

        print(
            "CROP PREDICTION SAVED TO SUPABASE"
        )

    except Exception as e:

        print(
            "ERROR RUNNING/SAVING CROP PREDICTION:"
        )

        print(e)


    if crop_prediction is not None:

        try:

            fertilizer_prediction = predict_fertilizer(
                sensor_record,
                crop_prediction["best_crop"]
            )

            save_fertilizer_prediction(
                crop_prediction,
                fertilizer_prediction
            )

            print(
                "FERTILIZER PREDICTION SAVED TO SUPABASE"
            )

        except Exception as e:

            # This commonly happens when the crop model predicts a
            # crop (e.g. a Philippine-specific crop like "calamansi")
            # that the fertilizer model's crop_encoder was never
            # trained on - the fertilizer dataset needs its own
            # matching update before this crop will work here.
            print(
                "ERROR RUNNING/SAVING FERTILIZER PREDICTION "
                "(crop likely not recognized by the fertilizer "
                "model's older dataset):"
            )

            print(e)


    # =====================================================
    # RETURN TO ESP32
    # =====================================================

    return {

        "status": "success",

        "message":
            "Real sensor data received",

        "data":
            data.model_dump(),

        "saved":
            sensor_record,

        "crop":
            crop_prediction,

        "fertilizer":
            fertilizer_prediction
    }