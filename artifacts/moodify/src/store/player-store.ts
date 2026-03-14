import { create } from "zustand";
import type { Song } from "@workspace/api-client-react";

interface PlayerState {
  currentSong: Song | null;
  queue: Song[];
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  historyId: number | null;
  youtubePlayer: any | null; // Ref to YT iframe API
  
  setSong: (song: Song, autoPlay?: boolean) => void;
  setQueue: (songs: Song[]) => void;
  addToQueue: (song: Song) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  setVolume: (v: number) => void;
  setProgress: (p: number) => void;
  setDuration: (d: number) => void;
  setHistoryId: (id: number) => void;
  setYoutubePlayer: (player: any) => void;
  seekTo: (seconds: number) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentSong: null,
  queue: [],
  isPlaying: false,
  volume: 50,
  progress: 0,
  duration: 0,
  historyId: null,
  youtubePlayer: null,

  setSong: (song, autoPlay = true) => {
    set({ currentSong: song, progress: 0, historyId: null, isPlaying: autoPlay });
  },
  
  setQueue: (songs) => set({ queue: songs }),
  
  addToQueue: (song) => set((state) => ({ queue: [...state.queue, song] })),
  
  play: () => {
    const { youtubePlayer } = get();
    if (youtubePlayer && typeof youtubePlayer.playVideo === 'function') {
      youtubePlayer.playVideo();
    }
    set({ isPlaying: true });
  },
  
  pause: () => {
    const { youtubePlayer } = get();
    if (youtubePlayer && typeof youtubePlayer.pauseVideo === 'function') {
      youtubePlayer.pauseVideo();
    }
    set({ isPlaying: false });
  },
  
  togglePlay: () => {
    const state = get();
    if (state.isPlaying) state.pause();
    else state.play();
  },
  
  next: () => {
    const { queue, currentSong } = get();
    if (queue.length === 0) return;
    
    const currentIndex = queue.findIndex(s => s.youtubeId === currentSong?.youtubeId);
    if (currentIndex >= 0 && currentIndex < queue.length - 1) {
      get().setSong(queue[currentIndex + 1]);
    } else {
      // Loop back or stop. Let's loop back for now.
      get().setSong(queue[0]);
    }
  },
  
  prev: () => {
    const { queue, currentSong, progress } = get();
    // If played more than 3 seconds, restart song instead of prev
    if (progress > 3) {
      get().seekTo(0);
      return;
    }
    
    if (queue.length === 0) return;
    const currentIndex = queue.findIndex(s => s.youtubeId === currentSong?.youtubeId);
    if (currentIndex > 0) {
      get().setSong(queue[currentIndex - 1]);
    }
  },
  
  setVolume: (v) => {
    const { youtubePlayer } = get();
    if (youtubePlayer && typeof youtubePlayer.setVolume === 'function') {
      youtubePlayer.setVolume(v);
    }
    set({ volume: v });
  },
  
  setProgress: (p) => set({ progress: p }),
  setDuration: (d) => set({ duration: d }),
  setHistoryId: (id) => set({ historyId: id }),
  setYoutubePlayer: (player) => set({ youtubePlayer: player }),
  
  seekTo: (seconds) => {
    const { youtubePlayer } = get();
    if (youtubePlayer && typeof youtubePlayer.seekTo === 'function') {
      youtubePlayer.seekTo(seconds, true);
    }
    set({ progress: seconds });
  }
}));
