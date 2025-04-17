import { useRef, useState, useEffect } from 'react';
import AudioVisualizer from './AudioVisualizer';

import playIcon from '../../assets/img/play-button.png';
import '../../styles/AudioPlayer.scss';
import audioFile from '../../assets/img/audio-kopilka.mp3';

const AudioPlayer = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState('0:00');
  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const onLoadedMetadata = () => {
        const mins = Math.floor(audio.duration / 60);
        const secs = Math.floor(audio.duration % 60);
        setDuration(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
      };
      audio.addEventListener('loadedmetadata', onLoadedMetadata);
      return () => audio.removeEventListener('loadedmetadata', onLoadedMetadata);
    }
  }, []);

  const togglePlay = () => {
    if (!hasPlayed) setHasPlayed(true);
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="audio-player">
      <audio ref={audioRef} src={audioFile} preload="metadata" />

      <div className="audio-player__play-button" onClick={togglePlay}>
        <img src={playIcon} alt="Play/Pause" />
      </div>

      <div className="audio-player__waveform">
        <AudioVisualizer audioRef={audioRef} isPlaying={isPlaying} hasPlayed={hasPlayed}/>
        <div className="audio-player__meta">
          <span className="audio-player__time">{duration}</span>
          <span className="audio-player__title">{audioFile.split('/').pop()}</span>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
