import { Router, type IRouter } from "express";
import { GetLikedSongsQueryParams, GetLikedSongsResponse, ToggleLikeBody, ToggleLikeResponse } from "@workspace/api-zod";
import { db, songsTable, likesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { detectEmotion, detectGenre } from "../lib/emotion";

const router: IRouter = Router();

router.get("/likes", async (req, res) => {
  const query = GetLikedSongsQueryParams.parse(req.query);
  const userId = query.userId || "default";

  try {
    const rows = await db.select()
      .from(likesTable)
      .leftJoin(songsTable, eq(likesTable.songId, songsTable.id))
      .where(eq(likesTable.userId, userId));

    const songs = rows
      .filter(r => r.songs !== null)
      .map(r => ({
        id: r.songs!.id,
        title: r.songs!.title,
        artist: r.songs!.artist,
        genre: r.songs!.genre,
        emotion: r.songs!.emotion,
        youtubeId: r.songs!.youtubeId,
        thumbnail: r.songs!.thumbnail || "",
        duration: r.songs!.duration || 0,
        isLiked: true,
      }));

    res.json(GetLikedSongsResponse.parse({ songs }));
  } catch (err) {
    console.error("Likes error:", err);
    res.status(500).json({ error: "Failed to get liked songs" });
  }
});

router.post("/likes/toggle", async (req, res) => {
  const body = ToggleLikeBody.parse(req.body);
  const { youtubeId, title, artist, genre, emotion, thumbnail, userId = "default" } = body;

  try {
    const detectedGenre = genre || detectGenre(title);
    const detectedEmotion = emotion || detectEmotion(title, detectedGenre);

    // Upsert song
    let song = await db.query.songsTable.findFirst({ where: eq(songsTable.youtubeId, youtubeId) });
    if (!song) {
      const [newSong] = await db.insert(songsTable).values({
        title,
        artist,
        genre: detectedGenre,
        emotion: detectedEmotion,
        youtubeId,
        thumbnail: thumbnail || "",
      }).returning();
      song = newSong;
    }

    // Check if already liked
    const existing = await db.query.likesTable.findFirst({
      where: and(eq(likesTable.userId, userId), eq(likesTable.songId, song!.id)),
    });

    if (existing) {
      await db.delete(likesTable)
        .where(and(eq(likesTable.userId, userId), eq(likesTable.songId, song!.id)));
      res.json(ToggleLikeResponse.parse({ liked: false, message: "Song unliked" }));
    } else {
      await db.insert(likesTable).values({ userId, songId: song!.id });
      res.json(ToggleLikeResponse.parse({ liked: true, message: "Song liked" }));
    }
  } catch (err) {
    console.error("Toggle like error:", err);
    res.status(500).json({ error: "Failed to toggle like" });
  }
});

export default router;
