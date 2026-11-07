import type { Track } from "./types";

export const SUPPORTED = /\.(mp3|wav|m4a|aac|ogg|oga|flac|opus|webm)$/i;

function readDuration(url: string): Promise<number | undefined> {
  return new Promise((res) => {
    const a = new Audio();
    a.preload = "metadata";
    a.onloadedmetadata = () => res(isFinite(a.duration) ? a.duration : undefined);
    a.onerror = () => res(undefined);
    a.src = url;
  });
}

function toDataUrl(data: Uint8Array, format: string): Promise<string> {
  return new Promise((res) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.readAsDataURL(new Blob([data as BlobPart], { type: format }));
  });
}

export async function analyzeFile(file: File): Promise<Track> {
  const base = file.name.replace(/\.[^.]+$/, "");
  const url = URL.createObjectURL(file);
  let title = base, artist = "Unknown artist", album = "", year: number | undefined, cover: string | undefined, duration: number | undefined;
  try {
    const mm = await import("music-metadata");
    const meta = await mm.parseBlob(file, { duration: true });
    const c = meta.common;
    title = c.title || base;
    artist = c.artist || c.albumartist || artist;
    album = c.album || "";
    year = c.year;
    duration = meta.format.duration;
    const pic = c.picture?.[0];
    if (pic) cover = await toDataUrl(pic.data, pic.format);
  } catch (e) {
    console.warn("metadata failed", file.name, e);
  }
  if (!duration) duration = await readDuration(url);
  return {
    id: `imp-${crypto.randomUUID()}`,
    title, artist, album: album || "Imported", movie: album || undefined, year, cover,
    src: url, duration, source: "imported", addedAt: Date.now(), fileName: file.name, mime: file.type,
  };
}
