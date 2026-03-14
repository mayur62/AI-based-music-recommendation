import { Router, type IRouter } from "express";
import { GetHistoryQueryParams, GetHistoryResponse } from "@workspace/api-zod";
import { db, historyTable, songsTable, likesTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";

const router: IRouter = Router();

router.get("/history", async (req, res) => {
  const query = GetHistoryQueryParams.parse(req.query);
  const userId = query.userId || "default";
  const limit = query.limit || 20;

  try {
    const rows = await db.select()
      .from(historyTable)
      .leftJoin(songsTable, eq(historyTable.songId, songsTable.id))
      .where(eq(historyTable.userId, userId))
      .orderBy(desc(historyTable.timestamp))
      .limit(limit);

    // Get liked song IDs
    const likedSongs = await db.select({ songId: likesTable.songId })
      .from(likesTable)
      .where(eq(likesTable.userId, userId));
    const likedIds = new Set(likedSongs.map(l => l.songId));

    const history = rows
      .filter(r => r.songs !== null)
      .map(r => ({
        id: r.history.id,
        song: {
          id: r.songs!.id,
          title: r.songs!.title,
          artist: r.songs!.artist,
          genre: r.songs!.genre,
          emotion: r.songs!.emotion,
          youtubeId: r.songs!.youtubeId,
          thumbnail: r.songs!.thumbnail || "",
          duration: r.songs!.duration || 0,
          isLiked: likedIds.has(r.songs!.id),
        },
        playPercentage: r.history.playPercentage || 0,
        timestamp: r.history.timestamp || new Date().toISOString(),
      }));

    res.json(GetHistoryResponse.parse({ history }));
  } catch (err) {
    console.error("History error:", err);
    res.status(500).json({ error: "Failed to get history" });
  }
});

export default router;
