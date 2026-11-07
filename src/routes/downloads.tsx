import { createFileRoute } from "@tanstack/react-router";
import { useLibrary } from "@/store/library";
import { TrackList, SongCard } from "@/components/music/SongCard";
import { Section } from "@/components/music/Cards";
import type { Track } from "@/lib/types";

export const Route = createFileRoute("/downloads")({
  head: () => ({ meta: [
    { title: "Downloads — AmberWave" },
    { name: "description", content: "Download songs to your device." },
    { property: "og:title", content: "Downloads — AmberWave" },
    { property: "og:description", content: "Download songs to your device." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Downloads,
});

function Downloads() {
  const { downloaded, getTrack, tracks } = useLibrary();
  const done = downloaded.map(getTrack).filter(Boolean) as Track[];
  return (
    <div className="page-in space-y-8">
      <h1 className="text-3xl font-semibold">Downloads</h1>
      <Section title="Downloaded"><div className="glass rounded-3xl p-2"><TrackList tracks={done} empty="Songs you download will appear here." /></div></Section>
      <Section title="Available to download">
        <div className="glass space-y-1 rounded-3xl p-2">{tracks.map((t, i) => <SongCard key={t.id} track={t} index={i} list={tracks} />)}</div>
      </Section>
    </div>
  );
}
