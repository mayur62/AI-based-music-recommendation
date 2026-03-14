import { useGetPlaylist, useRemoveFromPlaylist } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { SongCard } from "@/components/song-card";
import { Loader2, Music, Trash2, Clock } from "lucide-react";
import { getEmotionColor, getHighResThumbnail, formatTime } from "@/lib/helpers";
import { usePlayerStore } from "@/store/player-store";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

export default function PlaylistDetail() {
  const { id } = useParams();
  const playlistId = parseInt(id || "0", 10);
  
  const { data, isLoading } = useGetPlaylist(playlistId, {
    query: { enabled: !!playlistId }
  });
  
  const removeMutation = useRemoveFromPlaylist();
  const queryClient = useQueryClient();
  const { setSong, setQueue, currentSong, isPlaying } = usePlayerStore();

  const handleRemove = (youtubeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeMutation.mutate({
      playlistId,
      data: { youtubeId }
    }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [`/api/playlist/${playlistId}`] })
    });
  };

  const playAll = () => {
    if (data?.songs && data.songs.length > 0) {
      setQueue(data.songs);
      setSong(data.songs[0]);
    }
  };

  if (isLoading) return <div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!data) return <div className="p-8">Playlist not found.</div>;

  const { playlist, songs } = data;

  return (
    <div className="min-h-full">
      <div className="flex items-end gap-6 p-8 bg-gradient-to-b from-secondary to-background pt-24 pb-8 border-b border-border/30">
        <div className="w-52 h-52 bg-card border border-border shadow-2xl flex items-center justify-center rounded-sm overflow-hidden">
          {songs.length > 0 ? (
            <img src={getHighResThumbnail(songs[0].thumbnail)} alt="Cover" className="w-full h-full object-cover blur-[2px] scale-110 opacity-70 mix-blend-overlay" />
          ) : null}
          <Music className="w-20 h-20 text-muted-foreground absolute" />
        </div>
        <div className="flex flex-col gap-2 relative z-10">
          <span className="text-sm font-bold uppercase tracking-wider">Playlist</span>
          <h1 className="text-6xl font-display font-extrabold tracking-tight drop-shadow-lg">{playlist.name}</h1>
          <div className="flex items-center gap-2 mt-2 text-sm font-medium text-white/80">
            <span>Moodify User</span>
            <span>•</span>
            <span>{songs.length} songs</span>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {songs.length > 0 && (
          <div className="mb-8">
            <button 
              onClick={playAll}
              className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-black hover:scale-105 transition-transform shadow-xl shadow-primary/20"
            >
              <svg role="img" height="24" width="24" aria-hidden="true" viewBox="0 0 24 24"><path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z" fill="currentColor"></path></svg>
            </button>
          </div>
        )}

        {songs.length > 0 ? (
          <div className="w-full">
            <div className="grid grid-cols-[16px_4fr_2fr_1fr_min-content] gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b border-border/50 mb-4">
              <div>#</div>
              <div>Title</div>
              <div>Emotion</div>
              <div className="flex justify-end"><Clock className="w-4 h-4" /></div>
              <div></div>
            </div>
            
            <div className="space-y-1">
              {songs.map((song, index) => {
                const isCurrent = currentSong?.youtubeId === song.youtubeId;
                return (
                  <div 
                    key={`${song.youtubeId}-${index}`}
                    onClick={() => { setQueue(songs); setSong(song); }}
                    className="grid grid-cols-[16px_4fr_2fr_1fr_min-content] gap-4 px-4 py-3 items-center rounded-md hover:bg-white/10 group cursor-pointer transition-colors"
                  >
                    <div className="text-muted-foreground group-hover:hidden">{index + 1}</div>
                    <div className="hidden group-hover:block text-white"><Play className="w-4 h-4" /></div>
                    
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img src={song.thumbnail} className="w-10 h-10 object-cover rounded shadow-sm" alt="" />
                      <div className="truncate flex flex-col">
                        <span className={`truncate font-medium ${isCurrent ? 'text-primary' : 'text-white'}`}>{song.title}</span>
                        <span className="truncate text-sm text-muted-foreground">{song.artist}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      {song.emotion && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getEmotionColor(song.emotion)} uppercase tracking-wider`}>
                          {song.emotion}
                        </span>
                      )}
                    </div>
                    
                    <div className="text-muted-foreground text-sm flex justify-end">
                      {formatTime(song.duration || 0)}
                    </div>
                    
                    <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/20" onClick={(e) => handleRemove(song.youtubeId, e)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <h3 className="text-xl font-bold text-foreground mb-2">This playlist is empty</h3>
            <p>Go to Search to add some songs.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Ensure Play icon is imported
import { Play } from "lucide-react";
