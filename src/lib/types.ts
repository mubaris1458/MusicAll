export type TrackSource = "drive" | "imported";

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  movie?: string;
  standalone?: boolean;
  year?: number;
  cover?: string;
  src: string;
  duration?: number;
  source: TrackSource;
  addedAt: number;
  fileName?: string;
  composer?: string;
  mime?: string;
}

export interface Movie {
  id: string;
  title: string;
  year?: number;
  hero?: string;
  music?: string;
  cover?: string;
  tracks: Track[];
  source: TrackSource;
}

export interface Playlist {
  id: string;
  name: string;
  trackIds: string[];
  createdAt: number;
}

export const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "untitled";
