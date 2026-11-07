import type { Track } from "./types";

/** Group tracks by artist in a single pass (no array copying per song). */
export function groupByArtist(tracks: Track[], keep?: (artist: string, t: Track) => boolean): Map<string, Track[]> {
  const map = new Map<string, Track[]>();
  for (const t of tracks) {
    for (const a of t.artist.split(/,\s*/)) {
      if (keep && !keep(a, t)) continue;
      const list = map.get(a);
      if (list) list.push(t); else map.set(a, [t]);
    }
  }
  return map;
}
