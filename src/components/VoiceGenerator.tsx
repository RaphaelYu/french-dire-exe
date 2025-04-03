import { useState, useRef, useEffect } from 'react';
import { backend_domain } from './consts';

interface WordSegment {
  word: string;
  start: number;
  end: number;
}

export default function VoiceGenerator() {
  const [text, setText] = useState('');
  const [audioSrc, setAudioSrc] = useState('');
  const [subtitle, setSubtitle] = useState<WordSegment[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

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
      const audioUrl = `http://${backend_domain}:8000/voice/${data.audio}`;
      const subtitleUrl = `http://${backend_domain}:8000/subtitles/${data.subtitle}`;

      setAudioSrc(audioUrl);

      const subtitleResponse = await fetch(subtitleUrl);
      const subtitleData: WordSegment[] = await subtitleResponse.json();
      setSubtitle(subtitleData);
      setCurrentWordIndex(null);
    } catch (error) {
      alert("Failed to generate voice: " + error);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || !subtitle.length) return;

    const currentTime = audio.currentTime;
    const current = subtitle.findIndex(
      (seg) => currentTime >= seg.start && currentTime < seg.end
    );
   
    if (current !== -1 && current !== currentWordIndex) {
      console.log(`timupdate ${currentTime} ${current}`)
      setCurrentWordIndex(current);
    }
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
  }, [subtitle, currentWordIndex]);
  console.log(`update current idx is ${currentWordIndex}`)
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
          <audio ref={audioRef} controls autoPlay src={audioSrc} className="mt-6 w-full" />
          <div className="mt-4 border-t pt-4 text-xl flex flex-wrap gap-2">
            {subtitle.map((seg, idx) => (
              <span
                key={idx}
                style={{
                  color: idx === currentWordIndex ? '#ffffff' : '#666666',
                  backgroundColor: idx === currentWordIndex ? '#007bff' : undefined,
                  fontWeight: idx === currentWordIndex ? 'bold' : 'normal',
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}
              >
                {seg.word + ' '}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
