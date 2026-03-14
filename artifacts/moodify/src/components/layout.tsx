import { Sidebar } from "./sidebar";
import { BottomPlayer } from "./bottom-player";
import { YTController } from "./yt-controller";
import { usePlayerStore } from "@/store/player-store";

export function Layout({ children }: { children: React.ReactNode }) {
  const currentSong = usePlayerStore(s => s.currentSong);
  
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <Sidebar />
      <main className={`flex-1 relative overflow-y-auto ${currentSong ? 'pb-24' : ''}`}>
        {children}
      </main>
      <YTController />
      <BottomPlayer />
    </div>
  );
}
