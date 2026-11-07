import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Volume2, VolumeX, Loader2, ChevronDown, Heart } from "lucide-react";
import { usePlayer } from "@/store/player";
import { useLibrary } from "@/store/library";
import { Artwork, Visualizer } from "@/components/music/Artwork";
import { DownloadButton } from "@/components/music/DownloadButton";
import { PlayerProgressBar } from "./PlayerProgressBar";
import { QueueDrawer } from "./QueueDrawer";
import { slug } from "@/lib/types";
import { cn } from "@/lib/utils";

function Controls({ big }: { big?: boolean }) {
  const { playing, loading, toggle, next, prev, shuffle, toggleShuffle, repeat, cycleRepeat, current } = usePlayer();
  const sz = big ? "h-16 w-16" : "h-11 w-11";
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      <button aria-label="Shuffle" aria-pressed={shuffle} onClick={toggleShuffle} className={cn("grid h-9 w-9 place-items-center rounded-full hover:bg-accent", shuffle ? "text-amber" : "text-muted-foreground")}><Shuffle className="h-4 w-4" /></button>
      <button aria-label="Previous song" onClick={prev} disabled={!current} className="grid h-10 w-10 place-items-center rounded-full hover:bg-accent disabled:opacity-40"><SkipBack className="h-5 w-5 fill-current" /></button>
      <button aria-label={playing ? "Pause" : "Play"} onClick={toggle} disabled={!current} className={cn("grid place-items-center rounded-full bg-amber-gradient text-ink shadow-[var(--shadow-glow)] transition hover:scale-105 disabled:opacity-50", sz)}>
        {loading && playing ? <Loader2 className="h-5 w-5 animate-spin" /> : playing ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 translate-x-0.5 fill-current" />}
      </button>
      <button aria-label="Next song" onClick={next} disabled={!current} className="grid h-10 w-10 place-items-center rounded-full hover:bg-accent disabled:opacity-40"><SkipForward className="h-5 w-5 fill-current" /></button>
      <button aria-label={`Repeat: ${repeat}`} onClick={cycleRepeat} className={cn("grid h-9 w-9 place-items-center rounded-full hover:bg-accent", repeat !== "off" ? "text-amber" : "text-muted-foreground")}>
        {repeat === "one" ? <Repeat1 className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}
      </button>
    </div>
  );
}

function Volume() {
  const { volume, muted, setVolume, toggleMute } = usePlayer();
  const v = muted ? 0 : volume;
  return (
    <div className="flex items-center gap-1">
      <button aria-label={muted ? "Unmute" : "Mute"} onClick={toggleMute} className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-accent">{v === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}</button>
      <input type="range" min={0} max={1} step={0.01} value={v} onChange={(e) => setVolume(Number(e.target.value))} aria-label="Volume" className="amber-range w-24" style={{ ["--pct" as string]: `${v * 100}%` }} />
    </div>
  );
}

export function MusicPlayer() {
  const { current, playing } = usePlayer();
  const { favorites, toggleFavorite } = useLibrary();
  const [expanded, setExpanded] = useState(false);
  if (!current) return null;
  const movieId = slug(current.movie || current.album || "Imported");
  const fav = favorites.includes(current.id);

  return (
    <>
      {/* Desktop / tablet bar & mobile mini-player */}
      <div className="fixed inset-x-3 bottom-[5.25rem] z-40 animate-in slide-in-from-bottom-6 duration-500 lg:bottom-3">
        <div className="glass-strong grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-3xl p-2.5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,1fr)] lg:px-4">
          <div className="flex min-w-0 items-center gap-3">
            <button aria-label="Open now playing" onClick={() => setExpanded(true)} className={cn("shrink-0 rounded-full", playing && "glow-active")}>
              <Artwork src={current.cover} alt={current.title} spin={playing} className="h-12 w-12" />
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{current.title}</p>
              <Link to="/movie/$movieId" params={{ movieId }} className="block truncate text-xs text-muted-foreground hover:text-amber">{current.artist} · {current.movie || current.album}</Link>
            </div>
            <Visualizer active={playing} className="ml-1 hidden sm:flex" />
          </div>
          <div className="hidden flex-col items-center gap-1 lg:flex">
            <Controls />
            <PlayerProgressBar />
          </div>
          <div className="flex items-center justify-end gap-1">
            <div className="lg:hidden"><MiniToggle /></div>
            <button aria-label="Favorite" onClick={() => toggleFavorite(current.id)} className="hidden h-9 w-9 place-items-center rounded-full hover:bg-accent sm:grid"><Heart className={cn("h-4 w-4", fav ? "fill-amber text-amber" : "text-muted-foreground")} /></button>
            <div className="hidden lg:flex"><Volume /></div>
            <QueueDrawer />
          </div>
          <PlayerProgressBar compact className="col-span-2 -mb-1 px-1 lg:hidden" />
        </div>
      </div>

      {/* Expanded now playing */}
      {expanded && (
        <div className="fixed inset-0 z-50 flex animate-in fade-in slide-in-from-bottom-10 flex-col items-center overflow-y-auto bg-ink/60 p-6 backdrop-blur-2xl duration-500">
          <button aria-label="Close now playing" onClick={() => setExpanded(false)} className="glass self-start rounded-full p-2"><ChevronDown className="h-5 w-5" /></button>
          <div className="flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 py-6">
            <div className={cn("rounded-full p-2", playing && "glow-active")}>
              <Artwork src={current.cover} alt={current.title} spin={playing} className="h-64 w-64 sm:h-80 sm:w-80" />
            </div>
            <div className="w-full text-center">
              <h2 className="text-2xl font-semibold">{current.title}</h2>
              <Link to="/movie/$movieId" params={{ movieId }} onClick={() => setExpanded(false)} className="text-sm text-muted-foreground hover:text-amber">{current.artist} · {current.movie || current.album}</Link>
            </div>
            <Visualizer active={playing} className="h-8 [&>span]:w-1.5" />
            <PlayerProgressBar />
            <Controls big />
            <div className="flex items-center gap-2"><Volume /><DownloadButton track={current} /><QueueDrawer /></div>
          </div>
        </div>
      )}
    </>
  );
}

function MiniToggle() {
  const { playing, toggle, next } = usePlayer();
  return (
    <div className="flex items-center">
      <button aria-label={playing ? "Pause" : "Play"} onClick={toggle} className="grid h-10 w-10 place-items-center rounded-full bg-amber-gradient text-ink">{playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}</button>
      <button aria-label="Next song" onClick={next} className="grid h-9 w-9 place-items-center rounded-full hover:bg-accent"><SkipForward className="h-4 w-4 fill-current" /></button>
    </div>
  );
}
