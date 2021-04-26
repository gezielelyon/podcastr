import { useContext, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Slider from 'rc-slider';

import 'rc-slider/assets/index.css';

import { UsePlayer } from '../../contexts/PlayerContext';

import styles from './styles.module.scss';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

export function Player() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);
  
  const {
    episodesList, 
    currentEpisodeIndex, 
    isPlaying,
    isLooping,
    isShuffling,
    handleTogglePlay,
    handleToggleLoop,
    handleToggleShuffle,
    handleSetIsPlaying,
    handlePlayLeft,
    handlePlayNext,
    handleClearPlayerState,
    hasPrevious,
    hasNext
  } = UsePlayer();

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }
    
    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  function handleSetupProgressListiner (){
    audioRef.current.currentTime = 0;

    audioRef.current.addEventListener('timeupdate', event => {
      setProgress(Math.floor(audioRef.current.currentTime));
    })
  }

  function handleSeek(value: number) {
    audioRef.current.currentTime = value;
    setProgress(value);
  }

  function handleEpisodeEnded() {
    if (hasNext) {
      handlePlayNext();
    } else {
      handleClearPlayerState();
    }
  }

  const episode = episodesList[currentEpisodeIndex];

  return(
    <div className={styles.playerContainer}>
      
      <header>
        <img src="/playing.svg" alt='Tocando agora' />
        <strong>Tocando agora</strong>
      </header>

      {episode ? (
        <div className={styles.currentEpisode}>
          <Image height={592} width={592} src={episode.thumbnail} objectFit="cover" />
          <strong>{episode.title}</strong>
          <span>{episode.members}</span>
        </div>
      ) : (
        <div className={styles.emptyPlayer}>
          <strong>Selecione um podcast para ouvir</strong>
        </div>
      )}

      <footer className={!episode ? styles.empty : ''}>
        
        <div className={styles.progress}>
          <span>{convertDurationToTimeString(progress)} </span>
          <div className={styles.slider}>
            {episode ? (
              <Slider 
                min={0} 
                max={episode.duration}
                value={progress}
                onChange={(value) => handleSeek(value)}
                trackStyle={{backgroundColor: '#04d361'}}
                railStyle={{backgroundColor: '#9f75ff'}}
                handleStyle={{borderColor: '#04d361', borderWidth: 4}}
              />
            ) : (
              <div className={styles.emptySlider}/>
            )}
          </div>
          <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
        </div>

        {episode && (
          <audio
            ref={audioRef}
            src={episode.url}
            autoPlay
            loop={isLooping}
            onEnded={handleEpisodeEnded}
            onPlay={() => handleSetIsPlaying(true)}
            onPause={() => handleSetIsPlaying(false)}
            onLoadedMetadata={handleSetupProgressListiner}
          />
        )}
        
        <div className={styles.buttons}>
          <button 
            type="button" 
            disabled={!episode || episodesList.length == 1}
            onClick={() => handleToggleShuffle()}
            className={isShuffling ? styles.isActive : ''}>
            <img src="/shuffle.svg" alt="Embaralhar" />
          </button>
          <button type="button" disabled={!episode || !hasPrevious} onClick={() => handlePlayLeft()}>
            <img src="/play-previous.svg" alt="Tocar anterior" />
          </button>
          <button
            type="button"
            className={styles.playButton}
            disabled={!episode}
            onClick={() => handleTogglePlay()}
          >
          {isPlaying ? (
              <img src="/pause.svg" alt="Pausar" />
            ) : (
              <img src="/play.svg" alt="Tocar" />
          )}
          </button>
          <button type="button" disabled={!episode || !hasNext} onClick={() => handlePlayNext()}>
              <img src="/play-next.svg" alt="Tocar próximo" />
          </button>
          <button 
            type="button" 
            disabled={!episode} 
            onClick={() => handleToggleLoop()}
            className={isLooping ? styles.isActive : ''}>
            <img src="/repeat.svg" alt="Repetir" />
          </button>
        </div>
      </footer>

    </div>
  );
}