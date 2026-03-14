import { useGetHistory, useGetRecommendations } from "@workspace/api-client-react";
import { SongCard } from "@/components/song-card";
import { Loader2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { usePlayerStore } from "@/store/player-store";

const MOODS = [
  { id: "happy", label: "😊 Happy", color: "from-yellow-500/20 to-yellow-600/10 border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/30" },
  { id: "sad", label: "😢 Sad", color: "from-blue-500/20 to-blue-600/10 border-blue-500/40 text-blue-400 hover:bg-blue-500/30" },
  { id: "calm", label: "😌 Calm", color: "from-green-500/20 to-green-600/10 border-green-500/40 text-green-400 hover:bg-green-500/30" },
  { id: "excited", label: "🔥 Excited", color: "from-orange-500/20 to-orange-600/10 border-orange-500/40 text-orange-400 hover:bg-orange-500/30" },
  { id: "angry", label: "😤 Angry", color: "from-red-500/20 to-red-600/10 border-red-500/40 text-red-400 hover:bg-red-500/30" },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

export default function Home() {
  const { data: historyData, isLoading: historyLoading } = useGetHistory({ userId: "default", limit: 6 });
  const { currentSong } = usePlayerStore();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  
  // Recommend based on the most recently played song or a default
  const seedSong = currentSong || historyData?.history?.[0]?.song;
  
  const { data: recData, mutate: getRecs, isPending: recsLoading } = useGetRecommendations();
  const { data: moodRecData, mutate: getMoodRecs, isPending: moodRecsLoading } = useGetRecommendations();

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

  const handleMoodSelect = (moodId: string) => {
    const newMood = selectedMood === moodId ? null : moodId;
    setSelectedMood(newMood);
    if (newMood) {
      getMoodRecs({ data: { emotion: newMood, userId: "default" } });
    }
  };

  const recentSongs = historyData?.history?.map(h => h.song) || [];
  const recSongs = recData?.songs || [];
  const moodSongs = moodRecData?.songs || [];

  return (
    <div className="min-h-full pb-8">
      {/* Hero Header */}
      <div className="relative h-72 flex items-end p-8">
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-gradient-to-br from-primary/30 via-primary/10 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
        <div className="relative z-10">
          <h1 className="text-5xl font-display font-bold drop-shadow-xl">{getGreeting()}</h1>
          <p className="text-lg text-muted-foreground mt-2">What would you like to listen to?</p>
        </div>
      </div>

      <div className="px-8 space-y-12 mt-4 relative z-10">
        
        {/* Mood Selector */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">Browse by Mood</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {MOODS.map(mood => (
              <button
                key={mood.id}
                onClick={() => handleMoodSelect(mood.id)}
                className={`px-6 py-3 rounded-full border bg-gradient-to-r font-bold text-sm transition-all duration-300 ${mood.color} ${
                  selectedMood === mood.id ? 'ring-2 ring-white/30 scale-105 shadow-lg' : 'opacity-80 hover:opacity-100 hover:scale-105'
                }`}
              >
                {mood.label}
              </button>
            ))}
          </div>

          {/* Mood Results */}
          {selectedMood && (
            <div className="mt-6">
              {moodRecsLoading ? (
                <div className="flex h-32 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : moodSongs.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                  {moodSongs.map((song, i) => (
                    <SongCard key={`mood-${song.youtubeId}-${i}`} song={song} queue={moodSongs} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No songs found for this mood. Try searching!</p>
              )}
            </div>
          )}
        </section>

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
