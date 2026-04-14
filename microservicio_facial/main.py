from fastapi import FastAPI
from pydantic import BaseModel
import base64
import numpy as np
import cv2
from deepface import DeepFace

app = FastAPI()

class VerifyRequest(BaseModel):
    image_base64: str
    reference_base64: str

def decode_base64_image(base64_string):
    base64_string = base64_string.split(",")[-1]
    img_bytes = base64.b64decode(base64_string)
    img_array = np.frombuffer(img_bytes, np.uint8)
    return cv2.imdecode(img_array, cv2.IMREAD_COLOR)

@app.get("/status")
def status():
    return {"status": "ok"}

@app.post("/verify")
def verify(data: VerifyRequest):
    img1 = decode_base64_image(data.image_base64)
    img2 = decode_base64_image(data.reference_base64)

    if img1 is None or img2 is None:
        return {"verified": False, "error": "Error al decodificar imágenes"}

    try:
        result = DeepFace.verify(
            img1_path=img1,
            img2_path=img2,
            model_name="Facenet512",
            detector_backend="opencv",
            enforce_detection=True
        )

        return {
            "verified": bool(result["verified"]),
            "distance": float(result["distance"]),
            "threshold": float(result["threshold"])
        }

    except Exception as e:
        return {"verified": False, "error": str(e)}
