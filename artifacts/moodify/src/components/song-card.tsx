import { Play, Heart, MoreHorizontal } from "lucide-react";
import { usePlayerStore } from "@/store/player-store";
import type { Song } from "@workspace/api-client-react";
import { getEmotionColor, getHighResThumbnail } from "@/lib/helpers";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { AddToPlaylistDialog } from "./add-to-playlist-dialog";

export function SongCard({ song, queue = [] }: { song: Song, queue?: Song[] }) {
  const { setSong, currentSong, isPlaying, setQueue } = usePlayerStore();
  const [showDialog, setShowDialog] = useState(false);

  const isCurrent = currentSong?.youtubeId === song.youtubeId;

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (queue.length > 0) setQueue(queue);
    setSong(song);
  };

  return (
    <>
      <div 
        onClick={handlePlay}
        className="group relative p-4 bg-card rounded-xl hover:bg-secondary transition-all duration-300 cursor-pointer shadow-lg shadow-black/20 hover:shadow-xl border border-border/50 hover:-translate-y-1"
      >
        <div className="relative aspect-square mb-4 rounded-md overflow-hidden shadow-md">
          <img 
            src={getHighResThumbnail(song.thumbnail)} 
            alt={song.title}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          />
          <div className={`absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isCurrent ? 'opacity-100 bg-black/60' : ''}`}>
            <button className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-black hover:scale-105 transition-transform shadow-lg shadow-black/40">
              <Play className="w-6 h-6 ml-1" fill="currentColor" />
            </button>
          </div>
        </div>
        
        <div className="flex flex-col gap-1">
          <h3 className={`font-bold truncate ${isCurrent ? 'text-primary' : 'text-foreground'}`}>
            {song.title}
          </h3>
          <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
        </div>

        <div className="mt-3 flex items-center justify-between">
          {song.emotion ? (
            <Badge variant="outline" className={`${getEmotionColor(song.emotion)} font-medium capitalize text-xs px-2 py-0.5 border`}>
              {song.emotion}
            </Badge>
          ) : <div />}
          
          <button 
            onClick={(e) => { e.stopPropagation(); setShowDialog(true); }}
            className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      <AddToPlaylistDialog song={song} open={showDialog} onOpenChange={setShowDialog} />
    </>
  );
}
