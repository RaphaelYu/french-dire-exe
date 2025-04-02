from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import time
import os
import edge_tts
import subtitle
import json
subtitle.init_models()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

output_dir = "data"
class VoiceRequest(BaseModel):
    text: str
    voice: str = "fr-FR-DeniseNeural"
    rate: str = "+0%"

@app.post("/generate-voice")
async def generate_voice(request: VoiceRequest):
    global output_dir
    os.makedirs(output_dir, exist_ok=True)
    base_name=f"voice_{int(time.time())}"
    audio_name = f"{base_name}.mp3"
    subtitle_name=f"{base_name}_sub.json"
    audiopath = os.path.join(output_dir, audio_name)
    subpath=os.path.join(output_dir,subtitle_name)

    tts = edge_tts.Communicate(text=request.text, voice=request.voice, rate=request.rate)
    await tts.save(audiopath)

    print(f"📄 Saved audio: {audiopath}")
    sub_json=subtitle.generate_subtitles(audiopath)
    with open(subpath,"w") as f:
        json.dump(sub_json,f,indent=2)
    print(f"📝 Saved subtitles: {subpath}")

    save_data = {
        "id": base_name,
        "text": request.text,
        "audio": audio_name,
        "subtitles": subtitle_name
    }

    return {
        "id": base_name,
        "text": request.text,
        "audio": audio_name,
        "subtitle": subtitle_name
    }


@app.get("/voice/{filename}")
async def get_voice(filename: str):
    filepath = os.path.join("data", filename)
    return FileResponse(filepath)

@app.get("/subtitles/{filename}")
async def get_subs(filename:str):
    filepath = os.path.join("data", filename)
    return FileResponse(filepath)