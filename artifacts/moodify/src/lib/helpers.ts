import type { Song } from "@workspace/api-client-react";

export function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function getEmotionColor(emotion?: string) {
  if (!emotion) return "emotion-default";
  const e = emotion.toLowerCase();
  if (e.includes("happy") || e.includes("joy")) return "emotion-happy";
  if (e.includes("sad") || e.includes("melancholy")) return "emotion-sad";
  if (e.includes("angry") || e.includes("intense")) return "emotion-angry";
  if (e.includes("calm") || e.includes("chill") || e.includes("relax")) return "emotion-calm";
  if (e.includes("excited") || e.includes("energy")) return "emotion-excited";
  return "emotion-default";
}

export function getHighResThumbnail(url?: string) {
  if (!url) return "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop";
  return url.replace("hqdefault.jpg", "maxresdefault.jpg");
}
