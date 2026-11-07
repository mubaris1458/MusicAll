import { Heart, ListPlus, MoreHorizontal, Pencil, Play, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { useState } from "react";
import type { Track } from "@/lib/types";
import { formatTime } from "@/lib/queue";
import { usePlayer } from "@/store/player";
import { useLibrary } from "@/store/library";
import { cn } from "@/lib/utils";
import { Artwork, Visualizer } from "./Artwork";
import { DownloadButton } from "./DownloadButton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MusicMetadataEditor } from "./MusicMetadataEditor";

interface Props {
  track: Track;
  index: number;
  list: Track[];
  onRemove?: () => void;
  onMove?: (dir: -1 | 1) => void;
}

/** A song row: artwork, title, artist, movie/album, play, favorite, download and menu. */
export function SongCard({ track, index, list, onRemove, onMove }: Props) {
  const { current, playing, playList, addToQueue } = usePlayer();
  const { favorites, toggleFavorite, playlists, addToPlaylist, createPlaylist } = useLibrary();
  const [editing, setEditing] = useState(false);
  const active = current?.id === track.id;
  const fav = favorites.includes(track.id);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => playList(list, index)}
      onKeyDown={(e) => e.key === "Enter" && playList(list, index)}
      className={cn("group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl p-2 pr-1 transition hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring", active && "glass glow-active")}
    >
      <div className="relative h-12 w-12 shrink-0">
        <Artwork src={track.cover} alt={track.title} className="h-12 w-12 rounded-xl" />
        <div className={cn("absolute inset-0 grid place-items-center rounded-xl bg-ink/50 opacity-0 transition group-hover:opacity-100", active && "opacity-100")}>
          {active ? <Visualizer active={playing} /> : <Play className="h-5 w-5 fill-current" />}
        </div>
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn("truncate font-semibold", active && "text-amber-gradient")}>{track.title}</p>
        </div>
        <p className="truncate text-xs text-muted-foreground">{track.artist}{track.movie ? ` · ${track.movie}` : track.album ? ` · ${track.album}` : ""}</p>
      </div>
      <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
        <span className="hidden w-12 text-right text-xs tabular-nums text-muted-foreground sm:block">{track.duration ? formatTime(track.duration) : ""}</span>
        <button aria-label={fav ? "Remove from favorites" : "Add to favorites"} onClick={() => toggleFavorite(track.id)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-accent">
          <Heart className={cn("h-4 w-4", fav ? "fill-amber text-amber" : "text-muted-foreground")} />
        </button>
        <DownloadButton track={track} className="hidden sm:grid" />
        <DropdownMenu>
          <DropdownMenuTrigger aria-label="More options" className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-accent">
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-strong w-52 text-foreground">
            <DropdownMenuItem onClick={() => addToQueue(track)}><ListPlus className="mr-2 h-4 w-4" />Play next</DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Add to playlist</DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="glass-strong text-foreground">
                <DropdownMenuItem onClick={() => { const p = createPlaylist(track.title + " mix"); addToPlaylist(p.id, track.id); }}>+ New playlist</DropdownMenuItem>
                {playlists.length > 0 && <DropdownMenuSeparator />}
                {playlists.map((p) => <DropdownMenuItem key={p.id} onClick={() => addToPlaylist(p.id, track.id)}>{p.name}</DropdownMenuItem>)}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem className="sm:hidden" onClick={() => document.querySelector<HTMLButtonElement>(`[aria-label="Download ${CSS.escape(track.title)}"]`)?.click()}>Download</DropdownMenuItem>
            {track.source === "imported" && <DropdownMenuItem onClick={() => setEditing(true)}><Pencil className="mr-2 h-4 w-4" />Edit details</DropdownMenuItem>}
            {onMove && (<>
              <DropdownMenuSeparator /><DropdownMenuLabel className="text-xs text-muted-foreground">Reorder</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onMove(-1)}><ArrowUp className="mr-2 h-4 w-4" />Move up</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onMove(1)}><ArrowDown className="mr-2 h-4 w-4" />Move down</DropdownMenuItem>
            </>)}
            {onRemove && <DropdownMenuItem onClick={onRemove} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Remove</DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {editing && <MusicMetadataEditor track={track} open={editing} onOpenChange={setEditing} />}
    </div>
  );
}

export function TrackList({ tracks, empty, onRemove, onMove }: { tracks: Track[]; empty?: string; onRemove?: (t: Track) => void; onMove?: (i: number, dir: -1 | 1) => void }) {
  if (!tracks.length) return <EmptyState text={empty ?? "No songs here yet."} />;
  return (
    <div className="space-y-1">
      {tracks.map((t, i) => (
        <SongCard key={t.id + i} track={t} index={i} list={tracks} onRemove={onRemove ? () => onRemove(t) : undefined} onMove={onMove ? (d) => onMove(i, d) : undefined} />
      ))}
    </div>
  );
}

export function EmptyState({ text, action }: { text: string; action?: React.ReactNode }) {
  return (
    <div className="glass flex flex-col items-center gap-3 rounded-3xl px-6 py-12 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-amber-gradient text-ink">♪</div>
      <p className="max-w-sm text-sm text-muted-foreground">{text}</p>
      {action}
    </div>
  );
}
