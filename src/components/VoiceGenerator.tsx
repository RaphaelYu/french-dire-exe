import { useState, useRef, useEffect } from 'react';
import { backend_domain } from './consts';
export default function VoiceGenerator() {
  const [text, setText] = useState('');
  const [audioSrc, setAudioSrc] = useState('');
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [sentences, setSentences] = useState<string[]>([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);

  const generateVoice = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://${backend_domain}:8000/generate-voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text ,  voice: "fr-FR-DeniseNeural",
          rate: "+0%"}),
      });

      const data = await response.json();
      setAudioSrc(`http://${backend_domain}:8000/voice/${data.filepath}`);

      
      const splitSentences = text.split(/(?<=\.|\?|!)/).map(s => s.trim()).filter(Boolean);
      console.log(`there are ${splitSentences.length}`)
      setSentences(splitSentences);
      setCurrentSentenceIndex(0);
    } catch (error) {
      alert("Failed to generate voice: " + error);
    } finally {
      setLoading(false);
    }
  };

  
  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const progress = audio.currentTime / audio.duration;
    const index = Math.floor(progress * sentences.length);
    setCurrentSentenceIndex(index);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('timeupdate', handleTimeUpdate);
    }
    return () => {
      if (audio) {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
      }
    };
  }, [sentences]);

  return (
    <div className="p-6">
      <textarea
        className="border rounded w-full p-4"
        placeholder="Enter French text here..."
        rows={8}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        onClick={generateVoice}
        disabled={loading || !text}
      >
        {loading ? 'Generating...' : 'Generate Voice'}
      </button>

      {audioSrc && (
        <>
          <audio ref={audioRef} controls autoPlay src={audioSrc} className="mt-6 w-full">
            Your browser does not support audio playback.
          </audio>
          <div className="mt-4 border-t pt-4 text-xl">
            {sentences.map((sentence, idx) => (
              <p
                key={idx}
                style={{
                  color: idx === currentSentenceIndex ? 'blue' : 'gray',
                  fontWeight: idx === currentSentenceIndex ? 'bold' : 'normal'
                }}
              >
                {sentence}
              </p>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
