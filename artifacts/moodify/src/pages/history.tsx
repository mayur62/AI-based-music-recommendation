import { useGetHistory } from "@workspace/api-client-react";
import { Loader2, Clock } from "lucide-react";
import { SongCard } from "@/components/song-card";
import { formatDistanceToNow } from "date-fns";

export default function History() {
  const { data, isLoading } = useGetHistory({ userId: "default", limit: 50 });

  const historyItems = data?.history || [];
  const playableSongs = historyItems.map(h => h.song);

  return (
    <div className="p-8 min-h-full">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-secondary flex items-center justify-center rounded-full shadow-lg">
          <Clock className="w-8 h-8 text-foreground" />
        </div>
        <h1 className="text-4xl font-display font-bold">Listening History</h1>
      </div>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : historyItems.length > 0 ? (
        <div className="space-y-12">
          {/* Group by rough time blocks for aesthetic (simplified to list view) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-y-10 gap-x-6">
            {historyItems.map((item, i) => (
              <div key={`hist-${item.id}-${i}`} className="flex flex-col gap-2">
                <SongCard song={item.song} queue={playableSongs} />
                <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                  <span>{formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}</span>
                  <span className="font-mono bg-secondary px-1.5 py-0.5 rounded text-[10px]">
                    {Math.round(item.playPercentage)}% played
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <Clock className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <h3 className="text-xl font-bold text-foreground mb-2">No listening history</h3>
          <p>Your played tracks will show up here.</p>
        </div>
      )}
    </div>
  );
}
