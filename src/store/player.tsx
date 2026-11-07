import type React from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { Track } from "@/lib/types";
import { buildOrder, continuation, nextPos, prevPos, type RepeatMode } from "@/lib/queue";
import { useLibrary } from "./library";

interface PlayerCtx {
  queue: Track[];
  order: number[];
  pos: number;
  current?: Track;
  playing: boolean;
  loading: boolean;
  duration: number;
  volume: number;
  muted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  playList: (tracks: Track[], startIndex?: number, opts?: { shuffle?: boolean }) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (t: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  jumpTo: (orderPos: number) => void;
  addToQueue: (t: Track) => void;
  clearQueue: () => void;
}

const g = globalThis as unknown as { __playerCtx?: React.Context<PlayerCtx | null> };
const Ctx = (g.__playerCtx ??= createContext<PlayerCtx | null>(null));
// Playback time changes ~4x/sec; it lives in its own context so only the progress bar re-renders, not every card/row.
const gt = globalThis as unknown as { __playerTimeCtx?: React.Context<number> };
const TimeCtx = (gt.__playerTimeCtx ??= createContext<number>(0));

export function PlayerProvider({ children }: { children: ReactNode }) {
  const { pushRecent, tracks: allTracks } = useLibrary();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const allRef = useRef<Track[]>([]);
  allRef.current = allTracks;
  const [queue, setQueue] = useState<Track[]>([]);
  const [order, setOrder] = useState<number[]>([]);
  const [pos, setPos] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVol] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("off");
  const state = useRef({ order, pos, repeat, queue });
  state.current = { order, pos, repeat, queue };

  const current = pos >= 0 ? queue[order[pos]] : undefined;

  const loadAndPlay = useCallback((t: Track) => {
    const a = audioRef.current; if (!a) return;
    a.src = t.src;
    setTime(0); setDuration(t.duration ?? 0); setLoading(true);
    a.play().catch((e) => { if (e?.name !== "AbortError") { setLoading(false); setPlaying(false); } });
    pushRecent(t.id);
  }, [pushRecent]);

  const goTo = useCallback((p: number) => {
    const { order, queue } = state.current;
    if (p < 0) { audioRef.current?.pause(); return; }
    setPos(p);
    loadAndPlay(queue[order[p]]);
  }, [loadAndPlay]);

  // Queue ran out: append related songs (same movie/artist first, then the rest) so playback keeps going.
  const extendQueue = useCallback((from: Track) => {
    const { queue, order } = state.current;
    const more = continuation(allRef.current, queue, from, 30);
    if (!more.length) return { more, startPos: -1 };
    const start = queue.length;
    const nextQueue = [...queue, ...more];
    const nextOrder = [...order, ...more.map((_, i) => start + i)];
    state.current = { ...state.current, queue: nextQueue, order: nextOrder };
    setQueue(nextQueue); setOrder(nextOrder);
    return { more, startPos: order.length };
  }, []);

  const next = useCallback(() => {
    const { pos, order, repeat, queue } = state.current;
    const p = nextPos(pos, order.length, repeat === "one" ? "all" : repeat);
    if (p < 0) {
      const cur = queue[order[pos]];
      const { more, startPos } = cur ? extendQueue(cur) : { more: [] as Track[], startPos: -1 };
      if (!more.length) { audioRef.current?.pause(); return; }
      goTo(startPos);
      return;
    }
    goTo(p);
  }, [goTo, extendQueue]);

  const prev = useCallback(() => {
    const a = audioRef.current;
    if (a && a.currentTime > 3) { a.currentTime = 0; return; }
    const { pos, order, repeat } = state.current;
    goTo(prevPos(pos, order.length, repeat));
  }, [goTo]);

  useEffect(() => {
    const a = new Audio();
    a.preload = "metadata";
    a.crossOrigin = "anonymous";
    audioRef.current = a;
    const on = (ev: string, fn: () => void) => a.addEventListener(ev, fn);
    on("play", () => setPlaying(true));
    on("pause", () => setPlaying(false));
    on("playing", () => setLoading(false));
    on("waiting", () => setLoading(true));
    on("timeupdate", () => setTime(a.currentTime));
    on("loadedmetadata", () => setDuration(a.duration || 0));
    on("ended", () => {
      if (state.current.repeat === "one") { a.currentTime = 0; a.play(); return; }
      const { pos, order, repeat, queue } = state.current;
      const p = nextPos(pos, order.length, repeat);
      if (p < 0) {
        const cur = queue[order[pos]];
        const { more, startPos } = cur ? extendQueue(cur) : { more: [] as Track[], startPos: -1 };
        if (!more.length) { setPlaying(false); return; }
        setPos(startPos);
        state.current = { ...state.current, pos: startPos };
        const t = more[0];
        a.src = t.src; a.play().catch(() => {});
        pushRecent(t.id);
        return;
      }
      setPos(p);
      const t = state.current.queue[order[p]];
      a.src = t.src; a.play().catch(() => {});
      pushRecent(t.id);
    });
    on("error", () => {
      if (!a.src) return;
      setLoading(false); setPlaying(false);
      toast.error("This song couldn't be played. Skipping…");
      setTimeout(() => {
        const { pos, order } = state.current;
        if (pos + 1 < order.length) goTo(pos + 1);
      }, 900);
    });
    return () => { a.pause(); a.src = ""; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { if (audioRef.current) { audioRef.current.volume = volume; audioRef.current.muted = muted; } }, [volume, muted]);

  // Media Session for OS controls
  useEffect(() => {
    if (!current || typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({ title: current.title, artist: current.artist, album: current.movie || current.album, artwork: current.cover && !current.cover.startsWith("data:") ? [{ src: current.cover }] : [] });
    navigator.mediaSession.setActionHandler("nexttrack", next);
    navigator.mediaSession.setActionHandler("previoustrack", prev);
  }, [current, next, prev]);

  const playList = useCallback((tracks: Track[], startIndex = 0, opts?: { shuffle?: boolean }) => {
    if (!tracks.length) return;
    const sh = opts?.shuffle ?? shuffle;
    const start = opts?.shuffle ? Math.floor(Math.random() * tracks.length) : startIndex;
    if (opts?.shuffle !== undefined) setShuffle(opts.shuffle);
    const o = buildOrder(tracks.length, start, sh);
    setQueue(tracks); setOrder(o);
    const p = o.indexOf(start);
    setPos(p);
    state.current = { ...state.current, queue: tracks, order: o, pos: p };
    loadAndPlay(tracks[start]);
  }, [shuffle, loadAndPlay]);

  const toggle = useCallback(() => {
    const a = audioRef.current; if (!a || !current) return;
    if (a.paused) a.play().catch(() => {}); else a.pause();
  }, [current]);

  // Keyboard shortcuts
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;
      if (e.code === "Space") { e.preventDefault(); toggle(); }
      else if (e.shiftKey && e.key === "ArrowRight") next();
      else if (e.shiftKey && e.key === "ArrowLeft") prev();
      else if (e.key.toLowerCase() === "m") setMuted((m) => !m);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [toggle, next, prev]);

  // Memoized: playback time ticks ~4x/sec and must NOT re-render every song row / card.
  const value = useMemo<PlayerCtx>(() => ({
    queue, order, pos, current, playing, loading, duration, volume, muted, shuffle, repeat,
    playList, toggle, next, prev,
    seek: (t) => { if (audioRef.current) { audioRef.current.currentTime = t; setTime(t); } },
    setVolume: (v) => { setVol(v); if (v > 0) setMuted(false); },
    toggleMute: () => setMuted((m) => !m),
    toggleShuffle: () => {
      const sh = !shuffle; setShuffle(sh);
      if (pos < 0) return;
      const cur = order[pos];
      const o = buildOrder(queue.length, cur, sh);
      setOrder(o); setPos(o.indexOf(cur));
    },
    cycleRepeat: () => setRepeat((r) => (r === "off" ? "all" : r === "all" ? "one" : "off")),
    jumpTo: goTo,
    addToQueue: (t) => {
      if (pos < 0) { playList([t]); return; }
      setQueue((q) => [...q, t]);
      setOrder((o) => { const n = [...o]; n.splice(pos + 1, 0, queue.length); return n; });
      toast.success(`"${t.title}" plays next`);
    },
    clearQueue: () => {
      if (pos < 0) return;
      const cur = queue[order[pos]];
      setQueue([cur]); setOrder([0]); setPos(0);
    },
  }), [queue, order, pos, current, playing, loading, duration, volume, muted, shuffle, repeat, playList, toggle, next, prev, goTo]);
  return <Ctx.Provider value={value}><TimeCtx.Provider value={time}>{children}</TimeCtx.Provider></Ctx.Provider>;
}

export function usePlayer() {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePlayer outside provider");
  return c;
}

export function usePlayerTime() {
  return useContext(TimeCtx);
}
