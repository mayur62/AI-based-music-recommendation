import { useGetPlaylists, useCreatePlaylist } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Music, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";

export default function Library() {
  const { data, isLoading } = useGetPlaylists({ userId: "default" });
  const createMutation = useCreatePlaylist();
  const queryClient = useQueryClient();
  
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");

  const handleCreate = () => {
    if (!newName.trim()) return;
    createMutation.mutate({
      data: { name: newName, userId: "default" }
    }, {
      onSuccess: () => {
        setShowCreate(false);
        setNewName("");
        queryClient.invalidateQueries({ queryKey: ["/api/playlists"] });
      }
    });
  };

  return (
    <div className="p-8 min-h-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-display font-bold">Your Library</h1>
        <Button onClick={() => setShowCreate(true)} className="gap-2 rounded-full font-bold">
          <Plus className="w-5 h-5" />
          Create Playlist
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          
          <Link href="/likes">
            <div className="group relative p-4 bg-gradient-to-br from-indigo-600 to-blue-400 rounded-xl hover:shadow-xl transition-all duration-300 cursor-pointer h-64 flex flex-col justify-end">
              <h3 className="text-3xl font-bold mb-2">Liked Songs</h3>
              <p className="text-sm font-medium opacity-80">All your favorite tracks</p>
            </div>
          </Link>

          {data?.playlists?.map(p => (
            <Link key={p.id} href={`/playlist/${p.id}`}>
              <div className="group p-4 bg-card rounded-xl hover:bg-secondary transition-all duration-300 cursor-pointer shadow-lg shadow-black/20 hover:-translate-y-1 h-64 flex flex-col">
                <div className="flex-1 bg-secondary rounded-md mb-4 flex items-center justify-center shadow-inner group-hover:bg-background transition-colors">
                  <Music className="w-16 h-16 text-muted-foreground opacity-50 group-hover:text-primary transition-colors" />
                </div>
                <h3 className="font-bold truncate text-lg">{p.name}</h3>
                <p className="text-sm text-muted-foreground">Playlist • {p.songCount || 0} songs</p>
              </div>
            </Link>
          ))}

        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle>Create New Playlist</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input 
              placeholder="My Awesome Playlist"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="bg-background border-border focus-visible:ring-primary h-12 text-lg"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending || !newName.trim()}>
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
