from fastapi import FastAPI
from pydantic import BaseModel
import base64
import numpy as np
import cv2

app = FastAPI()

class VerifyRequest(BaseModel):
    image_base64: str
    reference_base64: str

@app.get("/status")
def status():
    return {"status": "ok"}

def decode_base64_image(base64_string):
    base64_string = base64_string.split(",")[-1]
    img_bytes = base64.b64decode(base64_string)
    img_array = np.frombuffer(img_bytes, np.uint8)
    return cv2.imdecode(img_array, cv2.IMREAD_COLOR)

@app.post("/verify")
def verify(data: VerifyRequest):
    img_login = decode_base64_image(data.image_base64)
    img_ref = decode_base64_image(data.reference_base64)

    if img_login is None or img_ref is None:
        return {"match": False, "error": "No se pudieron decodificar las imágenes"}

    gray_login = cv2.cvtColor(img_login, cv2.COLOR_BGR2GRAY)
    gray_ref = cv2.cvtColor(img_ref, cv2.COLOR_BGR2GRAY)

    gray_login = cv2.resize(gray_login, (200, 200))
    gray_ref = cv2.resize(gray_ref, (200, 200))

    diff = np.mean((gray_login - gray_ref) ** 2)

    threshold = 2000
    match = diff < threshold

    return {
        "match": bool(match),
        "difference": float(diff)
    }
