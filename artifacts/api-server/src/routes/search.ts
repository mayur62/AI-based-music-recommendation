import { Router, type IRouter } from "express";
import { SearchSongsBody, SearchSongsResponse } from "@workspace/api-zod";
import { db, songsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { detectEmotion, detectGenre } from "../lib/emotion";

const router: IRouter = Router();

router.post("/search", async (req, res) => {
  const body = SearchSongsBody.parse(req.body);
  const { query, userId = "default" } = body;

  try {
    const results = await searchYouTubeMusic(query, userId);
    const parsed = SearchSongsResponse.parse(results);
    res.json(parsed);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
});

async function searchYouTubeMusic(query: string, userId: string) {
  const response = await fetch(`http://localhost:${process.env.PYTHON_PORT || 8001}/ytm/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(`Python backend error: ${response.status}`);
  }

  const data = await response.json() as { results: any[] };

  const songs = (data.results || []).map((item: any) => {
    const emotion = item.emotion || detectEmotion(item.title || "", item.genre || "");
    const genre = item.genre || detectGenre(item.title || "");
    return {
      title: item.title || "Unknown",
      artist: item.artist || "Unknown",
      genre,
      emotion,
      youtubeId: item.youtubeId || item.videoId || "",
      thumbnail: item.thumbnail || "",
      duration: item.duration || 0,
      isLiked: false,
    };
  });

  return { songs, query };
}

export default router;
