import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Play } from "lucide-react";
import { useLibrary } from "@/store/library";
import { usePlayer } from "@/store/player";
import { TrackList } from "@/components/music/SongCard";
import { Button } from "@/components/ui/button";
import type { Track } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/library")({
  beforeLoad: () => { throw redirect({ to: "/albums" }); },
  head: () => ({ meta: [
    { title: "My Library — Tamil Music" },
    { name: "description", content: "Your imported songs, favourites and all Tamil songs." },
    { property: "og:title", content: "My Library — Tamil Music" },
    { property: "og:description", content: "Your imported songs, favourites and all Tamil songs." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: LibraryPage,
});

const TABS = ["Imported", "Favorites", "All Tamil songs"] as const;

function LibraryPage() {
  const { imported, tracks, favorites, getTrack } = useLibrary();
  const { playList } = usePlayer();
  const [tab, setTab] = useState<(typeof TABS)[number]>(imported.length ? "Imported" : "Favorites");
  const list: Track[] = tab === "Imported" ? imported : tab === "Favorites" ? (favorites.map(getTrack).filter(Boolean) as Track[]) : tracks.filter((t) => t.source === "drive");
  const empty = tab === "Imported" ? "No imported songs yet. Tap “Import Music” to add files from your device." : "Tap the heart on any song to save it here.";
  return (
    <div className="page-in space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold">My Library</h1>
        {list.length > 0 && <Button variant="amber" className="h-10 px-5" onClick={() => playList(list, 0)}><Play className="fill-current" />Play all</Button>}
      </div>
      <div className="flex gap-2 overflow-x-auto">
        {TABS.map((t) => <button key={t} onClick={() => setTab(t)} className={cn("shrink-0 rounded-full px-4 py-1.5 text-sm", tab === t ? "bg-amber-gradient font-semibold text-ink" : "glass")}>{t}</button>)}
      </div>
      <div className="glass rounded-3xl p-2"><TrackList tracks={list} empty={empty} /></div>
    </div>
  );
}
