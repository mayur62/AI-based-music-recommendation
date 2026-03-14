import { Play, Pause, SkipForward, SkipBack, Volume2, Heart, ListMusic, VolumeX } from "lucide-react";
import { usePlayerStore } from "@/store/player-store";
import { formatTime, getHighResThumbnail, getEmotionColor } from "@/lib/helpers";
import { Slider } from "@/components/ui/slider";
import { useToggleLike } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function BottomPlayer() {
  const { 
    currentSong, isPlaying, togglePlay, progress, duration, 
    seekTo, volume, setVolume, next, prev 
  } = usePlayerStore();
  
  const toggleMutation = useToggleLike();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(currentSong?.isLiked || false);

  const handleLike = () => {
    if (!currentSong) return;
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    toggleMutation.mutate({
      data: {
        youtubeId: currentSong.youtubeId,
        title: currentSong.title,
        artist: currentSong.artist,
        genre: currentSong.genre,
        emotion: currentSong.emotion,
        thumbnail: currentSong.thumbnail,
        userId: "default"
      }
    }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/likes"] })
    });
  };

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 glass-panel border-t flex items-center justify-between px-4 z-50">
      
      {/* Now Playing Info */}
      <div className="flex items-center gap-4 w-1/3 min-w-[200px]">
        <div className="relative group">
          <img 
            src={getHighResThumbnail(currentSong.thumbnail)} 
            alt="Album art" 
            className="w-14 h-14 rounded-md object-cover shadow-md"
          />
        </div>
        <div className="flex flex-col truncate">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm truncate hover:underline cursor-pointer">{currentSong.title}</span>
            {currentSong.emotion && (
              <Badge variant="outline" className={`text-[10px] px-1 py-0 h-4 border ${getEmotionColor(currentSong.emotion)}`}>
                {currentSong.emotion}
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground truncate hover:underline cursor-pointer">{currentSong.artist}</span>
        </div>
        <button onClick={handleLike} className={`ml-2 hover:scale-110 transition-transform ${isLiked ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
          <Heart className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center max-w-[40%] w-full gap-2">
        <div className="flex items-center gap-6">
          <button onClick={prev} className="text-muted-foreground hover:text-foreground transition-colors">
            <SkipBack className="w-5 h-5" fill="currentColor" />
          </button>
          <button 
            onClick={togglePlay} 
            className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center hover:scale-105 transition-transform"
          >
            {isPlaying ? <Pause className="w-4 h-4" fill="currentColor" /> : <Play className="w-4 h-4 ml-0.5" fill="currentColor" />}
          </button>
          <button onClick={next} className="text-muted-foreground hover:text-foreground transition-colors">
            <SkipForward className="w-5 h-5" fill="currentColor" />
          </button>
        </div>
        
        <div className="flex items-center gap-2 w-full text-xs text-muted-foreground font-medium">
          <span className="w-10 text-right">{formatTime(progress)}</span>
          <Slider
            value={[progress]}
            max={duration || 100}
            step={1}
            onValueChange={(v) => seekTo(v[0])}
            className="w-full cursor-pointer"
          />
          <span className="w-10 text-left">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Extra Controls (Volume) */}
      <div className="flex items-center justify-end gap-3 w-1/3 min-w-[200px] text-muted-foreground">
        <button className="hover:text-foreground transition-colors">
          <ListMusic className="w-5 h-5" />
        </button>
        <button onClick={() => setVolume(volume > 0 ? 0 : 50)} className="hover:text-foreground transition-colors ml-2">
          {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
        <div className="w-24">
          <Slider
            value={[volume]}
            max={100}
            step={1}
            onValueChange={(v) => setVolume(v[0])}
            className="cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
