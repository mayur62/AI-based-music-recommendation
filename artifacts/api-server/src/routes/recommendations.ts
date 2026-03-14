import { Router, type IRouter } from "express";
import { GetRecommendationsBody, GetRecommendationsResponse } from "@workspace/api-zod";
import { db, songsTable, likesTable } from "@workspace/db";
import { eq, inArray, not, and } from "drizzle-orm";
import { detectEmotion, getOppositeEmotion, getSimilarEmotions } from "../lib/emotion";

const router: IRouter = Router();

router.post("/recommend", async (req, res) => {
  const body = GetRecommendationsBody.parse(req.body);
  const { youtubeId, emotion, genre, artist, playPercentage = 0, userId = "default" } = body;

  try {
    let targetEmotion = emotion;
    let reason = "";
    let searchQuery = "";

    // Determine recommendation strategy based on play behavior
    if (playPercentage >= 0.9) {
      // Full like: same genre, artist, emotion
      targetEmotion = emotion;
      reason = "Based on your full listen - more like this!";
      searchQuery = `${genre || ""} ${emotion} music`;
    } else if (playPercentage <= 0.2) {
      // Skip: different emotion
      targetEmotion = getOppositeEmotion(emotion);
      reason = "Trying a different vibe since you skipped";
      searchQuery = `${targetEmotion} music`;
    } else {
      // Partial like: same emotion, better similarity
      targetEmotion = emotion;
      reason = "Similar songs you might enjoy more";
      searchQuery = `${targetEmotion} ${genre || ""} hits`;
    }

    // Get liked song IDs to exclude already-liked content
    const likedSongs = await db.select({ songId: likesTable.songId })
      .from(likesTable)
      .where(eq(likesTable.userId, userId));
    const likedIds = likedSongs.map(l => l.songId).filter(Boolean) as number[];

    // First, try to find matching songs from DB
    let dbSongs = await db.select()
      .from(songsTable)
      .where(eq(songsTable.emotion, targetEmotion))
      .limit(20);

    // Filter out the current song
    dbSongs = dbSongs.filter(s => s.youtubeId !== youtubeId);

    let songs = [];

    if (dbSongs.length >= 5) {
      // Score DB songs by similarity
      songs = scoreSongs(dbSongs, { emotion: targetEmotion, genre, artist }).slice(0, 10);
    } else {
      // Fall back to YouTube Music search
      try {
        const searchResponse = await fetch(`http://localhost:${process.env.PYTHON_PORT || 8001}/ytm/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: searchQuery || `${targetEmotion} music` }),
        });

        if (searchResponse.ok) {
          const data = await searchResponse.json() as { results: any[] };
          songs = (data.results || [])
            .filter((s: any) => s.youtubeId !== youtubeId && s.videoId !== youtubeId)
            .map((item: any) => ({
              title: item.title || "Unknown",
              artist: item.artist || "Unknown",
              genre: item.genre || genre || "pop",
              emotion: item.emotion || targetEmotion,
              youtubeId: item.youtubeId || item.videoId || "",
              thumbnail: item.thumbnail || "",
              duration: item.duration || 0,
              isLiked: false,
            }));
        }
      } catch (err) {
        console.error("YTM fallback error:", err);
      }
    }

    // Add liked status
    songs = await addLikedStatus(songs, userId, likedIds);

    res.json(GetRecommendationsResponse.parse({ songs: songs.slice(0, 10), reason }));
  } catch (err) {
    console.error("Recommend error:", err);
    res.status(500).json({ error: "Failed to get recommendations" });
  }
});

function scoreSongs(songs: any[], context: { emotion: string; genre?: string | null; artist?: string | null }) {
  return songs.map(song => {
    let score = 0;
    if (song.emotion === context.emotion) score += 3;
    if (context.genre && song.genre === context.genre) score += 2;
    if (context.artist && song.artist === context.artist) score += 1;
    return { ...song, similarityScore: score };
  }).sort((a, b) => b.similarityScore - a.similarityScore);
}

async function addLikedStatus(songs: any[], userId: string, likedIds: number[]) {
  return songs.map(s => ({
    ...s,
    isLiked: s.id ? likedIds.includes(s.id) : false,
  }));
}

export default router;
