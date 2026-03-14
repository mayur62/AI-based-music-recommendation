import { useGetHistory, useGetRecommendations } from "@workspace/api-client-react";
import { SongCard } from "@/components/song-card";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { usePlayerStore } from "@/store/player-store";

export default function Home() {
  const { data: historyData, isLoading: historyLoading } = useGetHistory({ userId: "default", limit: 6 });
  const { currentSong } = usePlayerStore();
  
  // Recommend based on the most recently played song or a default
  const seedSong = currentSong || historyData?.history?.[0]?.song;
  
  const { data: recData, mutate: getRecs, isPending: recsLoading } = useGetRecommendations();

  useEffect(() => {
    if (seedSong) {
      getRecs({
        data: {
          userId: "default",
          emotion: seedSong.emotion || "happy",
          youtubeId: seedSong.youtubeId,
          artist: seedSong.artist,
          genre: seedSong.genre
        }
      });
    } else if (historyData && !historyLoading) {
      // Default fallback
      getRecs({ data: { emotion: "happy", userId: "default" } });
    }
  }, [seedSong?.youtubeId, historyData]);

  const recentSongs = historyData?.history?.map(h => h.song) || [];
  const recSongs = recData?.songs || [];

  return (
    <div className="min-h-full pb-8">
      {/* Hero Header */}
      <div className="relative h-72 flex items-end p-8">
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
            alt="Hero" 
            className="w-full h-full object-cover opacity-60 mix-blend-screen"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
        <div className="relative z-10">
          <h1 className="text-5xl font-display font-bold drop-shadow-xl">Good afternoon</h1>
        </div>
      </div>

      <div className="px-8 space-y-12 mt-4 relative z-10">
        
        {/* Recent Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6 hover:underline cursor-pointer">Recently Played</h2>
          {historyLoading ? (
            <div className="flex h-32 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : recentSongs.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {recentSongs.map((song, i) => (
                <SongCard key={`recent-${song.youtubeId}-${i}`} song={song} queue={recentSongs} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Start playing music to build your history.</p>
          )}
        </section>

        {/* Recommendations Section */}
        <section>
          <div className="flex flex-col mb-6">
            <h2 className="text-2xl font-bold hover:underline cursor-pointer">Recommended For You</h2>
            {recData?.reason && <p className="text-sm text-primary mt-1">{recData.reason}</p>}
          </div>
          
          {recsLoading ? (
            <div className="flex h-32 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : recSongs.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {recSongs.map((song, i) => (
                <SongCard key={`rec-${song.youtubeId}-${i}`} song={song} queue={recSongs} />
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
