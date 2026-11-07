import { Link } from "@tanstack/react-router";
import { Play, ListMusic, Mic2 } from "lucide-react";
import type { Movie, Playlist, Track } from "@/lib/types";
import { usePlayer } from "@/store/player";
import { useLibrary } from "@/store/library";
import { Artwork, SourceBadge } from "./Artwork";
import { cn } from "@/lib/utils";

function PlayFab({ onPlay, label }: { onPlay: () => void; label: string }) {
  return (
    <button
      aria-label={label}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onPlay(); }}
      className="absolute bottom-3 right-3 grid h-11 w-11 translate-y-2 place-items-center rounded-full bg-amber-gradient text-ink opacity-0 shadow-[var(--shadow-glow)] transition group-hover:translate-y-0 group-hover:opacity-100 focus:opacity-100"
    >
      <Play className="h-5 w-5 fill-current" />
    </button>
  );
}

/** Movie soundtrack card — the home page shows movies, not single songs. */
export function MovieSoundtrackCard({ movie }: { movie: Movie }) {
  const { playList, current } = usePlayer();
  const active = movie.tracks.some((t) => t.id === current?.id);
  return (
    <Link to="/movie/$movieId" params={{ movieId: movie.id }} className={cn("group glass lift block rounded-3xl p-2.5", active && "glow-active")}>
      <div className="relative flex aspect-[4/3] flex-col justify-end rounded-2xl bg-gradient-to-br from-accent to-transparent p-4">
        <p className="line-clamp-3 font-display text-lg font-semibold leading-tight sm:text-xl">{movie.title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{movie.tracks.length} songs</p>
        <PlayFab label={`Play ${movie.title}`} onPlay={() => playList(movie.tracks, 0)} />
      </div>
    </Link>
  );
}

export function AlbumCard({ title, subtitle, cover, tracks, to }: { title: string; subtitle: string; cover?: string; tracks: Track[]; to?: { movieId: string } }) {
  const { playList } = usePlayer();
  const inner = (
    <>
      <div className="relative">
        <Artwork src={cover} alt={title} className="aspect-square w-full rounded-2xl" />
        <PlayFab label={`Play ${title}`} onPlay={() => playList(tracks, 0)} />
      </div>
      <p className="mt-2.5 truncate px-1 font-semibold">{title}</p>
      <p className="truncate px-1 text-xs text-muted-foreground">{subtitle}</p>
    </>
  );
  return to ? (
    <Link to="/movie/$movieId" params={to} className="group glass lift block rounded-3xl p-2.5">{inner}</Link>
  ) : (
    <div className="group glass lift rounded-3xl p-2.5">{inner}</div>
  );
}

export function ArtistCard({ name, tracks }: { name: string; tracks: Track[] }) {
  const { playList } = usePlayer();
  const cover = tracks.find((t) => t.cover)?.cover;
  return (
    <button onClick={() => playList(tracks, 0)} className="group glass lift flex flex-col items-center rounded-3xl p-4 text-center">
      <div className="relative">
        <Artwork src={cover} alt={name} className="h-24 w-24 rounded-full ring-2 ring-border sm:h-28 sm:w-28" />
        <span className="absolute bottom-0 right-0 grid h-8 w-8 place-items-center rounded-full bg-amber-gradient text-ink opacity-0 transition group-hover:opacity-100"><Play className="h-4 w-4 fill-current" /></span>
      </div>
      <p className="mt-3 line-clamp-1 font-semibold">{name}</p>
      <p className="flex items-center gap-1 text-xs text-muted-foreground"><Mic2 className="h-3 w-3" />{tracks.length} songs</p>
    </button>
  );
}

export function PlaylistCard({ playlist }: { playlist: Playlist }) {
  const { getTrack } = useLibrary();
  const { playList } = usePlayer();
  const tracks = playlist.trackIds.map(getTrack).filter(Boolean) as Track[];
  const covers = tracks.map((t) => t.cover).filter(Boolean).slice(0, 4) as string[];
  return (
    <Link to="/playlists/$playlistId" params={{ playlistId: playlist.id }} className="group glass lift block rounded-3xl p-2.5">
      <div className="relative grid aspect-square grid-cols-2 overflow-hidden rounded-2xl bg-amber-gradient">
        {covers.length >= 4 ? covers.map((c, i) => <img key={i} src={c} alt="" className="h-full w-full object-cover" />) : (
          <div className="col-span-2 grid place-items-center text-ink/70"><ListMusic className="h-1/3 w-1/3" /></div>
        )}
        {tracks.length > 0 && <PlayFab label={`Play ${playlist.name}`} onPlay={() => playList(tracks, 0)} />}
      </div>
      <p className="mt-2.5 truncate px-1 font-semibold">{playlist.name}</p>
      <p className="px-1 text-xs text-muted-foreground">{tracks.length} songs</p>
    </Link>
  );
}

export function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <h2 className="text-xl font-semibold sm:text-2xl">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export const gridCls = "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5";
