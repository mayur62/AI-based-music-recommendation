import { Play, Pause, SkipForward, SkipBack, Volume2, Heart, ListMusic, VolumeX, X, Trash2 } from "lucide-react";
import { usePlayerStore } from "@/store/player-store";
import { formatTime, getHighResThumbnail, getEmotionColor } from "@/lib/helpers";
import { Slider } from "@/components/ui/slider";
import { useToggleLike } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function BottomPlayer() {
  const { 
    currentSong, isPlaying, togglePlay, progress, duration, 
    seekTo, volume, setVolume, next, prev, queue, removeFromQueue, setSong
  } = usePlayerStore();
  
  const toggleMutation = useToggleLike();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(currentSong?.isLiked || false);
  const [showQueue, setShowQueue] = useState(false);

  // Reset isLiked when song changes
  useEffect(() => {
    setIsLiked(currentSong?.isLiked || false);
  }, [currentSong?.youtubeId]);

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
    <>
      {/* Queue Panel */}
      {showQueue && (
        <div className="fixed bottom-24 right-4 w-80 max-h-96 bg-card border border-border rounded-xl shadow-2xl shadow-black/50 z-50 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-bold text-sm">Queue ({queue.length})</h3>
            <button onClick={() => setShowQueue(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-y-auto flex-1">
            {queue.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">Queue is empty</p>
            ) : (
              queue.map((song, i) => {
                const isCurrent = song.youtubeId === currentSong?.youtubeId;
                return (
                  <div 
                    key={`q-${song.youtubeId}-${i}`}
                    className={`flex items-center gap-3 px-4 py-2 hover:bg-secondary/50 cursor-pointer ${isCurrent ? 'bg-primary/10 border-l-2 border-primary' : ''}`}
                    onClick={() => setSong(song)}
                  >
                    <img 
                      src={getHighResThumbnail(song.thumbnail)} 
                      alt="" 
                      className="w-10 h-10 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${isCurrent ? 'text-primary' : ''}`}>{song.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeFromQueue(i); }}
                      className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Player Bar */}
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

        {/* Extra Controls (Volume + Queue) */}
        <div className="flex items-center justify-end gap-3 w-1/3 min-w-[200px] text-muted-foreground">
          <button 
            onClick={() => setShowQueue(!showQueue)}
            className={`hover:text-foreground transition-colors ${showQueue ? 'text-primary' : ''}`}
          >
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
    </>
  );
}
