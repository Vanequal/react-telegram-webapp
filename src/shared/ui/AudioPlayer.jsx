import { useRef, useState, useEffect } from 'react';
import AudioVisualizer from './AudioVisualizer';

import playIcon from '../../assets/img/play-button.png';
import '../../styles/AudioPlayer.scss';
import audioFile from '../../assets/img/audio-kopilka.mp3';

const AudioPlayer = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [duration, setDuration] = useState('0:00');
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => {
      const mins = Math.floor(audio.duration / 60);
      const secs = Math.floor(audio.duration % 60);
      setDuration(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!hasPlayed) setHasPlayed(true);

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((e) => console.error('playback error:', e));
    }

    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="audio-player">
      <audio ref={audioRef} src={audioFile} preload="metadata" />

      <div className="audio-player__play-button" onClick={togglePlay}>
        <img src={playIcon} alt="Play/Pause" />
      </div>

      <div className="audio-player__waveform">
        <AudioVisualizer
          audioRef={audioRef}
          isPlaying={isPlaying}
          hasPlayed={hasPlayed}
        />
        <div className="audio-player__meta">
          <span className="audio-player__time">
            {formatTime(currentTime)} / {duration}
          </span>
          <span className="audio-player__title">
            {audioFile.split('/').pop()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
