import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useGetPlaylists, useAddToPlaylist, type Song } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Plus, Check, Loader2 } from "lucide-react";
import { useState } from "react";

interface AddToPlaylistDialogProps {
  song: Song;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddToPlaylistDialog({ song, open, onOpenChange }: AddToPlaylistDialogProps) {
  const { data, isLoading } = useGetPlaylists({ userId: "default" }, { query: { enabled: open } });
  const addMutation = useAddToPlaylist();
  const [addedPlaylists, setAddedPlaylists] = useState<Record<number, boolean>>({});

  const handleAdd = (playlistId: number) => {
    addMutation.mutate({
      data: {
        playlistId,
        youtubeId: song.youtubeId,
        title: song.title,
        artist: song.artist,
        genre: song.genre,
        emotion: song.emotion,
        thumbnail: song.thumbnail,
        userId: "default"
      }
    }, {
      onSuccess: () => {
        setAddedPlaylists(p => ({ ...p, [playlistId]: true }));
        toast({ title: "Added to playlist", description: `${song.title} was added.` });
        setTimeout(() => onOpenChange(false), 1500);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card text-card-foreground border-border">
        <DialogHeader>
          <DialogTitle className="text-xl">Add to Playlist</DialogTitle>
          <DialogDescription>
            Choose a playlist to add "{song.title}" by {song.artist}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto pr-2">
          {isLoading ? (
            <div className="flex justify-center py-8 text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : !data?.playlists?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              No playlists found. Create one in Your Library.
            </div>
          ) : (
            data.playlists.map(p => (
              <Button
                key={p.id}
                variant="ghost"
                className="w-full justify-between hover:bg-secondary/50 h-14"
                onClick={() => handleAdd(p.id)}
                disabled={addedPlaylists[p.id] || addMutation.isPending}
              >
                <span className="font-semibold">{p.name}</span>
                {addedPlaylists[p.id] ? (
                  <Check className="w-5 h-5 text-primary" />
                ) : (
                  <Plus className="w-5 h-5 text-muted-foreground" />
                )}
              </Button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
