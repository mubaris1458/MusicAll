import { slug, type Movie, type Track } from "./types";

export function groupMovies(tracks: Track[]): Movie[] {
  const map = new Map<string, Movie>();
  for (const track of tracks) {
    if (track.standalone) continue;
    const name = track.movie || track.album || "Imported";
    const id = slug(name);
    let movie = map.get(id);
    if (!movie) {
      movie = { id, title: name, year: track.year, music: track.composer || track.artist, tracks: [], source: track.source };
      map.set(id, movie);
    }
    movie.tracks.push(track);
  }
  return [...map.values()].sort((a, b) => a.title.localeCompare(b.title));
}