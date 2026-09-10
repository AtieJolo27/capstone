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


# =========================================================
# CROP + FERTILIZER PREDICTION
# =========================================================

@app.post("/predict")
def predict(sensor: SensorInput):

    sensor_data = sensor.model_dump()


    crop_prediction = predict_crop(
        sensor_data
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

        crop_prediction = predict_crop(
            sensor_record
        )

        fertilizer_prediction = predict_fertilizer(
            sensor_record,
            crop_prediction["best_crop"]
        )

        save_prediction(
            sensor_record,
            crop_prediction
        )

        save_fertilizer_prediction(
            crop_prediction,
            fertilizer_prediction
        )

        print(
            "CROP + FERTILIZER PREDICTION SAVED TO SUPABASE"
        )

    except Exception as e:

        print(
            "ERROR RUNNING/SAVING PREDICTION:"
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