import { useGetLikedSongs } from "@workspace/api-client-react";
import { SongCard } from "@/components/song-card";
import { Loader2, Heart } from "lucide-react";

export default function LikedSongs() {
  const { data, isLoading } = useGetLikedSongs({ userId: "default" });

  const songs = data?.songs || [];

  return (
    <div className="min-h-full">
      <div className="flex items-end gap-6 p-8 bg-gradient-to-b from-indigo-700/80 to-background pt-24 pb-12">
        <div className="w-52 h-52 bg-gradient-to-br from-indigo-500 to-blue-400 shadow-2xl flex items-center justify-center rounded-sm">
          <Heart className="w-24 h-24 text-white" fill="white" />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold uppercase tracking-wider">Playlist</span>
          <h1 className="text-6xl font-display font-extrabold tracking-tight drop-shadow-lg">Liked Songs</h1>
          <div className="flex items-center gap-2 mt-2 text-sm font-medium text-white/80">
            <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="User" className="w-6 h-6 rounded-full" />
            <span>Moodify User</span>
            <span>•</span>
            <span>{songs.length} songs</span>
          </div>
        </div>
      </div>

      <div className="px-8 py-4">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : songs.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {songs.map((song, i) => (
              <SongCard key={`liked-${song.youtubeId}-${i}`} song={song} queue={songs} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <Heart className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <h3 className="text-xl font-bold text-foreground mb-2">Songs you like will appear here</h3>
            <p>Save songs by tapping the heart icon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
