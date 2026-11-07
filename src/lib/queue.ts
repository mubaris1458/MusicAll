export type RepeatMode = "off" | "all" | "one";

/** Build a play order of indices [0..len). In shuffle mode the current index comes first, the rest randomized. */
export function buildOrder(len: number, current: number, shuffle: boolean, rand: () => number = Math.random): number[] {
  const idx = Array.from({ length: len }, (_, i) => i);
  if (!shuffle) return idx;
  const rest = idx.filter((i) => i !== current);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return current >= 0 && current < len ? [current, ...rest] : rest;
}

/** Next position in the order, or -1 when playback should stop. */
export function nextPos(pos: number, len: number, repeat: RepeatMode): number {
  if (len === 0) return -1;
  if (pos + 1 < len) return pos + 1;
  return repeat === "all" ? 0 : -1;
}

export function prevPos(pos: number, len: number, repeat: RepeatMode): number {
  if (len === 0) return -1;
  if (pos - 1 >= 0) return pos - 1;
  return repeat === "all" ? len - 1 : 0;
}

export function formatTime(s?: number) {
  if (!s || !isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export interface ContinuationKey {
  id: string;
  artist: string;
  movie?: string;
  album?: string;
}

/**
 * Songs to append when the queue has run out, so playback keeps going:
 * same movie/album or same artist first, then whatever is left. Already played songs are never repeated.
 */
export function continuation<T extends ContinuationKey>(all: T[], played: T[], current: T | undefined, limit = 30): T[] {
  const seen = new Set(played.map((t) => t.id));
  const pool = all.filter((t) => !seen.has(t.id));
  if (!pool.length) return [];
  const key = (t: T) => (t.movie || t.album || "").toLowerCase();
  const cur = current ? key(current) : "";
  const artists = (current?.artist ?? "").toLowerCase().split(/,\s*/).filter(Boolean);
  const same: T[] = [];
  const rest: T[] = [];
  for (const t of pool) {
    const related = (!!cur && key(t) === cur) || artists.some((a) => t.artist.toLowerCase().includes(a));
    (related ? same : rest).push(t);
  }
  return [...same, ...rest].slice(0, Math.max(0, limit));
}
