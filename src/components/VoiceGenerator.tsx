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
  console.log(`update current idx is ${currentWordIndex}`);
  return  (
    <div
      style={{
        padding: '1rem',
        maxWidth: '800px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      <textarea
        style={{
          width: '100%',
          minHeight: '140px',
          padding: '1rem',
          fontSize: '1rem',
          borderRadius: '8px',
          border: '1px solid #ccc',
          resize: 'vertical',
        }}
        placeholder="Enter French text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
  
      <button
        style={{
          backgroundColor: '#007bff',
          color: '#fff',
          fontWeight: 'bold',
          padding: '0.75rem 1.5rem',
          borderRadius: '6px',
          fontSize: '1rem',
          border: 'none',
          alignSelf: 'flex-start',
          cursor: loading ? 'wait' : 'pointer',
          opacity: loading || !text ? 0.6 : 1,
        }}
        disabled={loading || !text}
        onClick={generateVoice}
      >
        {loading ? 'Generating...' : 'Generate Voice'}
      </button>
  
      {audioSrc && (
        <>
          <audio
            ref={audioRef}
            controls
            autoPlay
            src={audioSrc}
            style={{ width: '100%' }}
          />
  
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              rowGap: '0.6rem',
              columnGap: '0.6rem',
              marginTop: '1rem',
              fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
              lineHeight: '2rem',
              paddingTop: '1rem',
              borderTop: '1px solid #ccc',
              maxHeight: '40vh',
              overflowY: 'auto',
            }}
          >
            {subtitle.map((seg, idx) => (
              <span
                key={idx}
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = seg.start;
                    audioRef.current.play();
                  }
                }}
                style={{
                  color: idx === currentWordIndex ? '#ffffff' : '#444444',
                  backgroundColor:
                    idx === currentWordIndex ? '#007bff' : undefined,
                  fontWeight: idx === currentWordIndex ? 'bold' : 'normal',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'keep-all',
                  transition: 'background-color 0.2s ease',
                }}
              >
                {seg.word}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
  
}
