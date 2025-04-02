# Load once at startup
import whisperx

model = None
align_model = None
align_metadata = None
device = "cpu"

def init_models():
    global model, align_model, align_metadata
    if model is None:
        print("🔧 Initializing whisperx model...")
        model = whisperx.load_model("medium", device=device,compute_type="int8")
        align_model, align_metadata = whisperx.load_align_model(
            language_code="fr",
            device=device
        )
        print("🔧 whisperx model initialized")
def generate_subtitles(audio_path: str):
    init_models()
    global model, align_model, align_metadata

    # Step 1: Transcribe
    result = model.transcribe(audio_path, language="fr")

    # Step 2: Align
    aligned = whisperx.align(result["segments"], align_model, align_metadata, audio_path, device=device)

    return aligned["word_segments"]

