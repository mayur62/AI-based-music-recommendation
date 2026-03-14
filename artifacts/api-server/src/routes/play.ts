import { Router, type IRouter } from "express";
import { PlaySongBody, PlaySongResponse, UpdateProgressBody, UpdateProgressResponse, SkipSongBody, SkipSongResponse } from "@workspace/api-zod";
import { db, songsTable, historyTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { detectEmotion, detectGenre } from "../lib/emotion";

const router: IRouter = Router();

router.post("/play", async (req, res) => {
  const body = PlaySongBody.parse(req.body);
  const { youtubeId, title, artist, genre, emotion, thumbnail, duration, userId = "default" } = body;

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
        duration: duration || 0,
      }).returning();
      song = newSong;
    }

    // Create history record
    const [history] = await db.insert(historyTable).values({
      userId,
      songId: song!.id,
      playPercentage: 0,
      playTime: 0,
      duration: duration || 0,
    }).returning();

    res.json(PlaySongResponse.parse({
      historyId: history.id,
      songId: song!.id,
      message: "Play recorded",
    }));
  } catch (err) {
    console.error("Play error:", err);
    res.status(500).json({ error: "Failed to record play" });
  }
});

router.post("/progress", async (req, res) => {
  const body = UpdateProgressBody.parse(req.body);
  const { historyId, playTime, duration } = body;

  try {
    const playPercentage = duration > 0 ? Math.min(playTime / duration, 1) : 0;
    await db.update(historyTable)
      .set({ playPercentage, playTime, duration })
      .where(eq(historyTable.id, historyId!));

    res.json(UpdateProgressResponse.parse({ playPercentage, message: "Progress updated" }));
  } catch (err) {
    console.error("Progress error:", err);
    res.status(500).json({ error: "Failed to update progress" });
  }
});

router.post("/skip", async (req, res) => {
  const body = SkipSongBody.parse(req.body);
  const { historyId, playTime, duration } = body;

  try {
    const playPercentage = duration > 0 ? Math.min(playTime / duration, 1) : 0;
    await db.update(historyTable)
      .set({ playPercentage, playTime, duration })
      .where(eq(historyTable.id, historyId!));

    res.json(SkipSongResponse.parse({ playPercentage, message: "Skip recorded" }));
  } catch (err) {
    console.error("Skip error:", err);
    res.status(500).json({ error: "Failed to record skip" });
  }
});

export default router;
