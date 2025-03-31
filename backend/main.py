from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import time
import os
import edge_tts
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class VoiceRequest(BaseModel):
    text: str
    voice: str = "fr-FR-DeniseNeural"
    rate: str = "+0%"

@app.post("/generate-voice")
async def generate_voice(request: VoiceRequest):
    output_dir = "data"
    os.makedirs(output_dir, exist_ok=True)

    filename = f"voice_{int(time.time())}.mp3"
    filepath = os.path.join(output_dir, filename)

    tts = edge_tts.Communicate(text=request.text, voice=request.voice, rate=request.rate)
    await tts.save(filepath)

    return {"filepath": filepath}

@app.get("/voice/{filename}")
async def get_voice(filename: str):
    filepath = os.path.join("data", filename)
    return FileResponse(filepath)
