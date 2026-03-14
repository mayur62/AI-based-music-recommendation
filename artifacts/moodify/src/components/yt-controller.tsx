import { useEffect, useRef } from "react";
import YouTube from "react-youtube";
import { usePlayerStore } from "@/store/player-store";
import { usePlaySong, useUpdateProgress, useSkipSong } from "@workspace/api-client-react";

export function YTController() {
  const { 
    currentSong, 
    isPlaying, 
    volume, 
    setYoutubePlayer, 
    setProgress, 
    setDuration, 
    setHistoryId,
    historyId,
    next,
    duration
  } = usePlayerStore();

  const playMutation = usePlaySong();
  const progressMutation = useUpdateProgress();
  const skipMutation = useSkipSong();
  
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const playerRef = useRef<any>(null);

  // Handle Play start API call
  useEffect(() => {
    if (currentSong && isPlaying && !historyId) {
      playMutation.mutate({
        data: {
          youtubeId: currentSong.youtubeId,
          title: currentSong.title,
          artist: currentSong.artist,
          genre: currentSong.genre,
          emotion: currentSong.emotion,
          thumbnail: currentSong.thumbnail,
          duration: currentSong.duration || 0,
          userId: "default"
        }
      }, {
        onSuccess: (res) => {
          if (res.historyId) setHistoryId(res.historyId);
        }
      });
    }
  }, [currentSong?.youtubeId, isPlaying, historyId]);

  // Handle Progress ticking API call
  useEffect(() => {
    if (isPlaying && historyId) {
      progressIntervalRef.current = setInterval(() => {
        if (playerRef.current) {
          const currentTime = playerRef.current.getCurrentTime();
          const dur = playerRef.current.getDuration() || duration;
          setProgress(currentTime);
          
          // API update every 10 seconds (optimized to reduce spam, but let's just log it here)
          if (Math.floor(currentTime) % 10 === 0 && currentTime > 0) {
            progressMutation.mutate({
              data: {
                historyId,
                playTime: currentTime,
                duration: dur,
                userId: "default"
              }
            });
          }
        }
      }, 1000);
    } else {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    }

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isPlaying, historyId, duration]);

  const onReady = (event: any) => {
    const player = event.target;
    playerRef.current = player;
    setYoutubePlayer(player);
    player.setVolume(volume);
  };

  const onStateChange = (event: any) => {
    // YT.PlayerState.PLAYING = 1
    // YT.PlayerState.ENDED = 0
    if (event.data === 1) {
      usePlayerStore.setState({ isPlaying: true });
      setDuration(event.target.getDuration());
    } else if (event.data === 2) {
      usePlayerStore.setState({ isPlaying: false });
    } else if (event.data === 0) {
      next(); // Auto play next
    }
  };

  if (!currentSong) return null;

  return (
    <div className="hidden">
      <YouTube
        videoId={currentSong.youtubeId}
        opts={{
          height: '0',
          width: '0',
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            rel: 0,
          },
        }}
        onReady={onReady}
        onStateChange={onStateChange}
      />
    </div>
  );
}
