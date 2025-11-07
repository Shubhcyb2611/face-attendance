import os
import json
import cv2
import numpy as np
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
import onnxruntime as ort
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

#adding middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # your frontend (Vite)
        "http://127.0.0.1:5173",
        "*",                       # optional wildcard
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------
# Load Models
# -----------------------
ARC_MODEL = "arcface.onnx"
arc_sess = ort.InferenceSession(ARC_MODEL, providers=["CPUExecutionProvider"])
arc_inp_name = arc_sess.get_inputs()[0].name
arc_out_name = arc_sess.get_outputs()[0].name

# -----------------------
# Storage Paths
# -----------------------
EMB_DB = "embeddings.json"

if not os.path.exists(EMB_DB):
    with open(EMB_DB, "w") as f:
        json.dump({}, f)

with open(EMB_DB, "r") as f:
    DB = json.load(f)

# -----------------------
# ArcFace Preprocessing
# -----------------------
def preprocess_arcface(face_bgr):
    face = cv2.resize(face_bgr, (112, 112))
    face = cv2.cvtColor(face, cv2.COLOR_BGR2RGB).astype(np.float32)
    face = (face - 127.5) / 128.0            # normalize
    face = np.expand_dims(face, 0)           # NHWC (1,112,112,3)
    return face

def embed_arcface(face_bgr):
    inp = preprocess_arcface(face_bgr)
    emb = arc_sess.run([arc_out_name], {arc_inp_name: inp})[0][0]
    emb = emb / (np.linalg.norm(emb) + 1e-12)
    return emb.astype(np.float32)

# -----------------------
# Face Detector
# -----------------------
detector = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

def extractFace(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = detector.detectMultiScale(gray, 1.1, 4)

    if len(faces) == 0:
        return None

    (x, y, w, h) = faces[0]
    return img[y:y+h, x:x+w]

# -----------------------
# ROUTES
# -----------------------
@app.get("/")
def root():
    return {"status": "ArcFace Server Running"}

# ✅ ENROLL STAFF
@app.post("/enroll")
async def enroll(staffId: str = Form(...), files: list[UploadFile] = File(...)):
    embeddings = []

    for file in files:
        data = await file.read()
        arr = np.frombuffer(data, np.uint8)
        img = cv2.imdecode(arr, cv2.IMREAD_COLOR)

        face = extractFace(img)
        if face is None:
            return JSONResponse({"success": False, "error": "No face detected in image: " + file.filename})

        emb = embed_arcface(face)
        embeddings.append(emb.tolist())

    # Average embedding of all images
    final_emb = np.mean(np.array(embeddings), axis=0).tolist()

    # Save
    DB[staffId] = final_emb
    with open(EMB_DB, "w") as f:
        json.dump(DB, f, indent=2)

    return {"success": True, "staffId": staffId, "images": len(files)}

# ✅ RECOGNIZE STAFF
@app.post("/recognize")
async def recognize(file: UploadFile):
    data = await file.read()
    arr = np.frombuffer(data, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)

    face = extractFace(img)
    if face is None:
        return {"success": False, "msg": "No face detected"}

    probe_emb = embed_arcface(face)

    best_id = None
    best_score = -1

    for staffId, stored_emb in DB.items():
        stored = np.array(stored_emb, dtype=np.float32)
        sim = np.dot(stored, probe_emb)  # cosine similarity

        if sim > best_score:
            best_score = sim
            best_id = staffId

    if best_score < 0.45:
        return {"success": False, "msg": "Unknown face", "score": float(best_score)}

    return {
        "success": True,
        "staffId": best_id,
        "score": round(float(best_score), 2)
    }
