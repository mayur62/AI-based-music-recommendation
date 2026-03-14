import { Home, Search, Library, PlusSquare, Heart, Music } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useGetPlaylists } from "@workspace/api-client-react";

export function Sidebar() {
  const [location] = useLocation();
  const { data } = useGetPlaylists({ userId: "default" });

  const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Search, label: "Search", href: "/search" },
    { icon: Library, label: "Your Library", href: "/library" },
  ];

  return (
    <div className="w-64 bg-sidebar h-full flex flex-col pt-6 shrink-0">
      <div className="px-6 mb-8 flex items-center gap-3">
        <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-8 h-8 rounded-full shadow-[0_0_15px_rgba(29,185,84,0.5)]" />
        <span className="text-xl font-display font-bold tracking-wider text-white">Moodify</span>
      </div>

      <div className="px-3 mb-6 space-y-1">
        {navItems.map((item) => {
          const active = location === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-4 px-3 py-2.5 rounded-md transition-colors font-semibold text-sm ${
                active ? "bg-secondary text-white" : "text-muted-foreground hover:text-white"
              }`}
            >
              <item.icon className={`w-6 h-6 ${active ? 'text-primary' : ''}`} />
              {item.label}
            </Link>
          )
        })}
      </div>

      <div className="px-3 mb-4 space-y-1">
        <Link 
          href="/history"
          className="flex items-center gap-4 px-3 py-2.5 rounded-md transition-colors font-semibold text-sm text-muted-foreground hover:text-white group"
        >
          <div className="w-6 h-6 bg-muted-foreground group-hover:bg-white rounded-[2px] flex items-center justify-center transition-colors">
            <Music className="w-4 h-4 text-black" />
          </div>
          Listening History
        </Link>
        <Link 
          href="/likes"
          className="flex items-center gap-4 px-3 py-2.5 rounded-md transition-colors font-semibold text-sm text-muted-foreground hover:text-white group"
        >
          <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-blue-400 rounded-[2px] flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
            <Heart className="w-4 h-4 text-white" fill="white" />
          </div>
          Liked Songs
        </Link>
      </div>

      <div className="mt-4 px-6 border-t border-border pt-4 flex-1 overflow-y-auto">
        <h3 className="text-xs uppercase font-bold text-muted-foreground tracking-widest mb-4">Playlists</h3>
        <div className="space-y-3">
          {data?.playlists?.map(p => (
            <Link 
              key={p.id} 
              href={`/playlist/${p.id}`}
              className="block text-sm text-muted-foreground hover:text-white truncate"
            >
              {p.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
