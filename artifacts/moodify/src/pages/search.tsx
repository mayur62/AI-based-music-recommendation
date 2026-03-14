import { Search as SearchIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { useSearchSongs } from "@workspace/api-client-react";
import { SongCard } from "@/components/song-card";

export default function Search() {
  const [query, setQuery] = useState("");
  const searchMutation = useSearchSongs();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    searchMutation.mutate({ data: { query, userId: "default" } });
  };

  const results = searchMutation.data?.songs || [];

  return (
    <div className="p-8 min-h-full bg-gradient-to-b from-secondary/30 to-background">
      <div className="max-w-3xl mx-auto mb-10">
        <form onSubmit={handleSearch} className="relative group">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within:text-foreground transition-colors" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you want to listen to?"
            className="w-full h-14 bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-transparent focus:border-border rounded-full pl-14 pr-6 text-lg placeholder:text-muted-foreground outline-none transition-all shadow-lg"
          />
        </form>
      </div>

      {searchMutation.isPending && (
        <div className="flex flex-col items-center justify-center mt-20 text-muted-foreground">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p>Searching for amazing tracks...</p>
        </div>
      )}

      {!searchMutation.isPending && searchMutation.isSuccess && results.length === 0 && (
        <div className="text-center mt-20 text-muted-foreground">
          <h3 className="text-xl font-bold text-foreground mb-2">No results found for "{query}"</h3>
          <p>Please make sure your words are spelled correctly or use less or different keywords.</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Top Results</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {results.map((song, i) => (
              <SongCard key={`search-${song.youtubeId}-${i}`} song={song} queue={results} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
