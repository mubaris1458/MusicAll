import { createFileRoute } from "@tanstack/react-router";
import { useLibrary } from "@/store/library";
import { TrackList } from "@/components/music/SongCard";
import type { Track } from "@/lib/types";

export const Route = createFileRoute("/recent")({
  head: () => ({ meta: [
    { title: "Recently Played — Tamil Music" },
    { name: "description", content: "Songs you played recently." },
    { property: "og:title", content: "Recently Played — Tamil Music" },
    { property: "og:description", content: "Songs you played recently." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Recent,
});

function Recent() {
  const { recent, getTrack } = useLibrary();
  const list = recent.map(getTrack).filter(Boolean) as Track[];
  return (
    <div className="page-in space-y-6">
      <h1 className="text-3xl font-semibold">Recently Played</h1>
      <div className="glass rounded-3xl p-2"><TrackList tracks={list} empty="Nothing played yet — pick a movie to get started." /></div>
    </div>
  );
}
