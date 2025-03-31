import { useState } from 'react';
const backend_domain="homesvr"
export default function VoiceGenerator() {
  const [text, setText] = useState('');
  const [audioSrc, setAudioSrc] = useState('');
  const [loading, setLoading] = useState(false);

  const generateVoice = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://${backend_domain}:8000/generate-voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: "fr-FR-DeniseNeural",
          rate: "+0%"
        }),
      });

      const data = await response.json();
      setAudioSrc(`http://${backend_domain}:8000/voice/${data.filepath}`);
    } catch (error) {
      alert("generate failure:" + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <textarea
        className="border rounded w-full p-4"
        placeholder="input french phrase here:"
        rows={8}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        onClick={generateVoice}
        disabled={loading || !text}
      >
        {loading ? 'generating...' : 'generate audio'}
      </button>

      {audioSrc && (
        <audio controls autoPlay src={audioSrc} className="mt-6 w-full">
        your brower not support  audio element。
        </audio>
      )}
    </div>
  );
}
