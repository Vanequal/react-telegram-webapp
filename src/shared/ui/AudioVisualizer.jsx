import { useEffect, useRef, useState } from 'react';

const AudioVisualizer = ({ audioRef }) => {
  const canvasRef = useRef(null);
  const [waveform, setWaveform] = useState([]);

  useEffect(() => {
    const barCount = 50;
    const bars = Array.from({ length: barCount }, () =>
      8 + Math.random() * 16
    );
    setWaveform(bars);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = (canvas.width = 300);
    const height = (canvas.height = 32);

    const draw = () => {
      const audio = audioRef?.current;
      const progress = audio?.currentTime && audio?.duration
        ? audio.currentTime / audio.duration
        : 0;

      ctx.clearRect(0, 0, width, height);

      const barWidth = 4;
      const gap = 2;
      let x = 0;

      waveform.forEach((barHeight, index) => {
        const isActive = index < progress * waveform.length;
        ctx.fillStyle = isActive ? '#1E88D3' : '#ccc';
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);
        x += barWidth + gap;
      });

      requestAnimationFrame(draw);
    };

    draw();
  }, [waveform, audioRef]);

  const handleClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = clickX / canvas.width;

    const audio = audioRef.current;
    if (audio && audio.duration) {
      audio.currentTime = percent * audio.duration;
    }
  };

  return (
    <canvas
      className="audio-visualizer"
      ref={canvasRef}
      onClick={handleClick}
      style={{ width: '100%', height: '32px', cursor: 'pointer' }}
    />
  );
};

export default AudioVisualizer;
