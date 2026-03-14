import { Router, type IRouter } from "express";
import {
  CreatePlaylistBody, CreatePlaylistResponse,
  AddToPlaylistBody, AddToPlaylistResponse,
  GetPlaylistsQueryParams, GetPlaylistsResponse,
  GetPlaylistParams, GetPlaylistResponse,
  RemoveFromPlaylistBody, RemoveFromPlaylistResponse, RemoveFromPlaylistParams
} from "@workspace/api-zod";
import { db, songsTable, playlistsTable, playlistSongsTable } from "@workspace/db";
import { eq, count, and } from "drizzle-orm";
import { detectEmotion, detectGenre } from "../lib/emotion";

const router: IRouter = Router();

router.get("/playlists", async (req, res) => {
  const query = GetPlaylistsQueryParams.parse(req.query);
  const userId = query.userId || "default";

  try {
    const playlists = await db.select().from(playlistsTable).where(eq(playlistsTable.userId, userId));

    const withCounts = await Promise.all(playlists.map(async (p) => {
      const [countResult] = await db.select({ count: count() })
        .from(playlistSongsTable)
        .where(eq(playlistSongsTable.playlistId, p.id));
      return {
        id: p.id,
        name: p.name,
        userId: p.userId,
        createdAt: p.createdAt || new Date().toISOString(),
        songCount: Number(countResult?.count || 0),
      };
    }));

    res.json(GetPlaylistsResponse.parse({ playlists: withCounts }));
  } catch (err) {
    console.error("Playlists error:", err);
    res.status(500).json({ error: "Failed to get playlists" });
  }
});

router.post("/playlist/create", async (req, res) => {
  const body = CreatePlaylistBody.parse(req.body);
  const { name, userId = "default" } = body;

  try {
    const [playlist] = await db.insert(playlistsTable).values({ name, userId, createdAt: new Date().toISOString() }).returning();
    res.json(CreatePlaylistResponse.parse({
      id: playlist.id,
      name: playlist.name,
      userId: playlist.userId,
      createdAt: playlist.createdAt || new Date().toISOString(),
      songCount: 0,
    }));
  } catch (err) {
    console.error("Create playlist error:", err);
    res.status(500).json({ error: "Failed to create playlist" });
  }
});

router.post("/playlist/add", async (req, res) => {
  const body = AddToPlaylistBody.parse(req.body);
  const { playlistId, youtubeId, title, artist, genre, emotion, thumbnail } = body;

  try {
    const detectedGenre = genre || detectGenre(title);
    const detectedEmotion = emotion || detectEmotion(title, detectedGenre);

    let song = await db.query.songsTable.findFirst({ where: eq(songsTable.youtubeId, youtubeId) });
    if (!song) {
      const [newSong] = await db.insert(songsTable).values({
        title, artist, genre: detectedGenre, emotion: detectedEmotion,
        youtubeId, thumbnail: thumbnail || "",
      }).returning();
      song = newSong;
    }

    // Check if already in playlist
    const existing = await db.query.playlistSongsTable.findFirst({
      where: and(eq(playlistSongsTable.playlistId, playlistId), eq(playlistSongsTable.songId, song!.id)),
    });
    if (!existing) {
      await db.insert(playlistSongsTable).values({ playlistId, songId: song!.id });
    }

    res.json(AddToPlaylistResponse.parse({ message: "Song added to playlist" }));
  } catch (err) {
    console.error("Add to playlist error:", err);
    res.status(500).json({ error: "Failed to add to playlist" });
  }
});

router.get("/playlist/:playlistId", async (req, res) => {
  const params = GetPlaylistParams.parse(req.params);
  const playlistId = params.playlistId;

  try {
    const playlist = await db.query.playlistsTable.findFirst({ where: eq(playlistsTable.id, playlistId) });
    if (!playlist) {
      res.status(404).json({ error: "Playlist not found" });
      return;
    }

    const rows = await db.select()
      .from(playlistSongsTable)
      .leftJoin(songsTable, eq(playlistSongsTable.songId, songsTable.id))
      .where(eq(playlistSongsTable.playlistId, playlistId));

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
        isLiked: false,
      }));

    res.json(GetPlaylistResponse.parse({
      playlist: {
        id: playlist.id,
        name: playlist.name,
        userId: playlist.userId,
        createdAt: playlist.createdAt || new Date().toISOString(),
        songCount: songs.length,
      },
      songs,
    }));
  } catch (err) {
    console.error("Get playlist error:", err);
    res.status(500).json({ error: "Failed to get playlist" });
  }
});

router.post("/playlist/:playlistId/remove", async (req, res) => {
  const params = RemoveFromPlaylistParams.parse(req.params);
  const body = RemoveFromPlaylistBody.parse(req.body);
  const playlistId = params.playlistId;
  const { youtubeId } = body;

  try {
    const song = await db.query.songsTable.findFirst({ where: eq(songsTable.youtubeId, youtubeId) });
    if (song) {
      await db.delete(playlistSongsTable)
        .where(and(eq(playlistSongsTable.playlistId, playlistId), eq(playlistSongsTable.songId, song.id)));
    }
    res.json(RemoveFromPlaylistResponse.parse({ message: "Song removed from playlist" }));
  } catch (err) {
    console.error("Remove from playlist error:", err);
    res.status(500).json({ error: "Failed to remove from playlist" });
  }
});

export default router;
