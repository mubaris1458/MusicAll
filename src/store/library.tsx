import type React from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { get, set, del } from "idb-keyval";
import { type Movie, type Playlist, type Track } from "@/lib/types";
import { groupMovies } from "@/lib/movies";
import { STANDALONE_TRACKS } from "@/data/standalone-songs";
import { analyzeFile } from "@/lib/metadata";
import driveRaw from "@/data/drive-songs.json";

type Row = [string, string, string, string, number | null, string, string];
const DRIVE_TRACKS: Track[] = (driveRaw as Row[]).map(([id, title, artist, movie, year, composer, fileName], i) => ({
  id: `drv-${id}`, title, artist, album: movie, movie, year: year ?? undefined, composer: composer || undefined,
  src: `/api/public/song/${id}`,
  source: "drive", addedAt: (year ?? 2000) * 10000 + i, fileName,
}));

interface LibraryCtx {
  tracks: Track[];
  imported: Track[];
  movies: Movie[];
  playlists: Playlist[];
  favorites: string[];
  recent: string[];
  downloaded: string[];
  getTrack: (id: string) => Track | undefined;
  importFiles: (files: File[], onProgress?: (done: number) => void) => Promise<Track[]>;
  updateTrack: (id: string, patch: Partial<Track>) => void;
  removeTrack: (id: string) => void;
  toggleFavorite: (id: string) => void;
  pushRecent: (id: string) => void;
  markDownloaded: (id: string) => void;
  createPlaylist: (name: string) => Playlist;
  renamePlaylist: (id: string, name: string) => void;
  deletePlaylist: (id: string) => void;
  addToPlaylist: (pid: string, tid: string) => void;
  removeFromPlaylist: (pid: string, tid: string) => void;
  moveInPlaylist: (pid: string, from: number, to: number) => void;
}

const g = globalThis as unknown as { __libraryCtx?: React.Context<LibraryCtx | null> };
const Ctx = (g.__libraryCtx ??= createContext<LibraryCtx | null>(null));

function useLocal<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { const raw = localStorage.getItem(key); if (raw) setV(JSON.parse(raw)); } catch { /* ignore */ }
    setReady(true);
  }, [key]);
  useEffect(() => { if (ready) localStorage.setItem(key, JSON.stringify(v)); }, [key, v, ready]);
  return [v, setV] as const;
}

type StoredTrack = Omit<Track, "src">;

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [imported, setImported] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useLocal<Playlist[]>("amber.playlists", []);
  const [favorites, setFavorites] = useLocal<string[]>("amber.favorites", []);
  const [recent, setRecent] = useLocal<string[]>("amber.recent", []);
  const [downloaded, setDownloaded] = useLocal<string[]>("amber.downloaded", []);

  // Restore imported audio from IndexedDB
  useEffect(() => {
    (async () => {
      const metas = ((await get("tracks")) as StoredTrack[] | undefined) ?? [];
      const restored: Track[] = [];
      for (const m of metas) {
        const blob = (await get(`blob:${m.id}`)) as Blob | undefined;
        if (blob) restored.push({ ...m, src: URL.createObjectURL(blob) });
      }
      setImported(restored);
    })().catch(console.error);
  }, []);

  const persist = (list: Track[]) => set("tracks", list.map(({ src: _s, ...rest }) => rest)).catch(console.error);

  const importFiles = useCallback(async (files: File[], onProgress?: (n: number) => void) => {
    const added: Track[] = [];
    for (let i = 0; i < files.length; i++) {
      const t = await analyzeFile(files[i]);
      await set(`blob:${t.id}`, files[i]).catch(console.error);
      added.push(t);
      onProgress?.(i + 1);
    }
    setImported((prev) => { const next = [...added, ...prev]; persist(next); return next; });
    return added;
  }, []);

  const updateTrack = useCallback((id: string, patch: Partial<Track>) => {
    setImported((prev) => { const next = prev.map((t) => (t.id === id ? { ...t, ...patch } : t)); persist(next); return next; });
  }, []);

  const removeTrack = useCallback((id: string) => {
    del(`blob:${id}`).catch(console.error);
    setImported((prev) => { const next = prev.filter((t) => t.id !== id); persist(next); return next; });
  }, []);

  const tracks = useMemo(() => [...imported, ...STANDALONE_TRACKS, ...DRIVE_TRACKS], [imported]);
  const byId = useMemo(() => new Map(tracks.map((t) => [t.id, t])), [tracks]);

  const movies = useMemo<Movie[]>(() => groupMovies([...DRIVE_TRACKS, ...STANDALONE_TRACKS, ...imported]), [imported]);

  const value = useMemo<LibraryCtx>(() => ({
    tracks, imported, movies, playlists, favorites, recent, downloaded,
    getTrack: (id) => byId.get(id),
    importFiles, updateTrack, removeTrack,
    toggleFavorite: (id) => setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [id, ...f])),
    pushRecent: (id) => setRecent((r) => [id, ...r.filter((x) => x !== id)].slice(0, 40)),
    markDownloaded: (id) => setDownloaded((d) => (d.includes(id) ? d : [id, ...d])),
    createPlaylist: (name) => {
      const p: Playlist = { id: crypto.randomUUID(), name: name || "New playlist", trackIds: [], createdAt: Date.now() };
      setPlaylists((ps) => [p, ...ps]);
      return p;
    },
    renamePlaylist: (id, name) => setPlaylists((ps) => ps.map((p) => (p.id === id ? { ...p, name } : p))),
    deletePlaylist: (id) => setPlaylists((ps) => ps.filter((p) => p.id !== id)),
    addToPlaylist: (pid, tid) => setPlaylists((ps) => ps.map((p) => (p.id === pid && !p.trackIds.includes(tid) ? { ...p, trackIds: [...p.trackIds, tid] } : p))),
    removeFromPlaylist: (pid, tid) => setPlaylists((ps) => ps.map((p) => (p.id === pid ? { ...p, trackIds: p.trackIds.filter((x) => x !== tid) } : p))),
    moveInPlaylist: (pid, from, to) => setPlaylists((ps) => ps.map((p) => {
      if (p.id !== pid || to < 0 || to >= p.trackIds.length) return p;
      const ids = [...p.trackIds]; const [x] = ids.splice(from, 1); ids.splice(to, 0, x);
      return { ...p, trackIds: ids };
    })),
  }), [tracks, imported, movies, playlists, favorites, recent, downloaded, byId, importFiles, updateTrack, removeTrack, setFavorites, setRecent, setDownloaded, setPlaylists]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLibrary() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useLibrary outside provider");
  return c;
}
