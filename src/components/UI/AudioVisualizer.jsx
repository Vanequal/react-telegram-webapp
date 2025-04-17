import { useEffect, useRef } from 'react';

const AudioVisualizer = ({ audioRef, isPlaying, hasPlayed }) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  let previousValues = useRef([]).current;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 300;
    canvas.height = 50;

    const drawFake = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barCount = 32;
      const barWidth = 8;
      let x = 0;

      for (let i = 0; i < barCount; i++) {
        const fakeHeight = 10 + Math.sin(i + Date.now() / 200) * 8;
        ctx.fillStyle = '#ccc';
        ctx.fillRect(x, canvas.height - fakeHeight, barWidth, fakeHeight);
        x += barWidth + 1;
      }

      if (!hasPlayed) {
        requestAnimationFrame(drawFake);
      }
    };

    if (!hasPlayed) {
      drawFake();
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    if (!contextRef.current) {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaElementSource(audio);
      const analyser = audioContext.createAnalyser();

      source.connect(analyser);
      analyser.connect(audioContext.destination);

      contextRef.current = { audioContext, analyser };
    }

    const { audioContext, analyser } = contextRef.current;
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    analyser.fftSize = 128;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    if (previousValues.length !== bufferLength) {
      previousValues = new Array(bufferLength).fill(0);
    }

    const drawReal = () => {
      requestAnimationFrame(drawReal);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = 5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const raw = dataArray[i];
        const normalized = Math.min(1, raw / 128);

        const lerpSpeed = 0.2;
        const smoothed = previousValues[i] + (normalized - previousValues[i]) * lerpSpeed;
        previousValues[i] = smoothed;

        const barHeight = smoothed * canvas.height * 0.8;

        ctx.fillStyle = '#1E88D3';
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };

    drawReal();
  }, [audioRef, isPlaying, hasPlayed]);

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
    />
  );
};

export default AudioVisualizer;
