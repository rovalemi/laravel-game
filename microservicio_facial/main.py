from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class FrameData(BaseModel):
    image_base64: str

@app.get("/status")
def status():
    return {"status": "ok"}

@app.post("/detect")
def detect(data: FrameData):
    # Aquí iría la lógica de reconocimiento facial
    # De momento, devuelve algo fijo para probar
    return {"detected": True, "confidence": 0.95}
