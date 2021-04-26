import {createContext, ReactNode, useContext, useState} from 'react';

type IEpisode = {
  title: string;
  members: string;
  thumbnail: string;
  duration: number;
  url: string;
}

type IPlayerContextData = {
  episodesList: IEpisode[];
  currentEpisodeIndex: number;
  isPlaying: boolean;
  isLooping: boolean;
  isShuffling: boolean;
  handlePlay: (episode: IEpisode) => void;
  handlePlayList: (list: IEpisode[], index: number) => void;
  handleTogglePlay: () => void;
  handleToggleLoop: () => void;
  handleToggleShuffle: () => void;
  handleSetIsPlaying: (state: boolean) => void;
  handlePlayNext: () => void;
  handlePlayLeft: () => void;
  handleClearPlayerState: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}

type IPlayerContextProviderProps = {
  children: ReactNode
}

const PlayerContext = createContext<IPlayerContextData>({} as IPlayerContextData);

export function PlayerContextProvider ({children}: IPlayerContextProviderProps) {
  const [episodesList, setEpisodesList] = useState([]); 
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);

  function handlePlay(episode: IEpisode) {
    setEpisodesList([episode]);
    setCurrentEpisodeIndex(0);
    setIsPlaying(true);
  }

  function handlePlayList(list: IEpisode[], index: number) {
    setEpisodesList(list);
    setCurrentEpisodeIndex(index);
    setIsPlaying(true);
  }

  function handleTogglePlay () {
    setIsPlaying(!isPlaying);
  }

  function handleToggleLoop (){
    setIsLooping(!isLooping);
  }

  function handleToggleShuffle (){
    setIsShuffling(!isShuffling);
  }

  function handleSetIsPlaying (state: boolean) {
    setIsPlaying(state);
  }

  const hasPrevious = (currentEpisodeIndex - 1) >= 0;
  const hasNext = isShuffling || (currentEpisodeIndex + 1) < episodesList.length;

  function handlePlayNext() {
    const nextEpisodeIndex = currentEpisodeIndex + 1;

    if (isShuffling) {
      const nextRandonEpisodeIndex = Math.floor(Math.random() * episodesList.length);
      setCurrentEpisodeIndex(nextRandonEpisodeIndex);
    } else if (nextEpisodeIndex >= episodesList.length) {
      return;
    } else {
      setCurrentEpisodeIndex(nextEpisodeIndex);
    }
  }

  function handlePlayLeft () {
    const leftEpisodeIndex = currentEpisodeIndex - 1;

    if (leftEpisodeIndex < 0) {
      setCurrentEpisodeIndex(0);
      return;
    }

    setCurrentEpisodeIndex(leftEpisodeIndex);
  }

  function handleClearPlayerState() {
    setEpisodesList([]);
    setCurrentEpisodeIndex(0);
    setIsPlaying(false);
    setIsLooping(false);
    setIsShuffling(false);
  }

  return (
    <PlayerContext.Provider 
      value={{
        episodesList, 
        currentEpisodeIndex,
        isPlaying,
        isLooping,
        isShuffling,
        handlePlay,
        handlePlayList,
        handleTogglePlay,
        handleToggleLoop,
        handleToggleShuffle,
        handleSetIsPlaying,
        handlePlayNext,
        handlePlayLeft,
        handleClearPlayerState,
        hasPrevious,
        hasNext
      }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function UsePlayer(): IPlayerContextData {
  const context = useContext(PlayerContext);

  if (!context) {
    throw new Error('UsePlayer must be used with PlayerContextProvider');
  }

  return context;
}