import { createFileRoute } from "@tanstack/react-router";
import { Shuffle } from "lucide-react";
import { useLibrary } from "@/store/library";
import { usePlayer } from "@/store/player";
import { MovieSoundtrackCard, Section, gridCls } from "@/components/music/Cards";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/discover")({
  head: () => ({ meta: [
    { title: "Discover — AmberWave" },
    { name: "description", content: "Discover movie soundtracks by composer and year." },
    { property: "og:title", content: "Discover — AmberWave" },
    { property: "og:description", content: "Discover movie soundtracks by composer and year." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Discover,
});

function Discover() {
  const { movies, tracks } = useLibrary();
  const { playList } = usePlayer();
  const byComposer = new Map<string, typeof movies>();
  for (const m of movies) { const k = m.music || "Various"; byComposer.set(k, [...(byComposer.get(k) ?? []), m]); }
  return (
    <div className="page-in space-y-10">
      <div className="glass flex flex-col items-start gap-4 rounded-[2rem] p-6 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-3xl font-semibold">Discover</h1><p className="text-sm text-muted-foreground">Find your next favourite soundtrack.</p></div>
        <Button variant="amber" className="h-11 px-6" onClick={() => playList(tracks, 0, { shuffle: true })}><Shuffle />Shuffle everything</Button>
      </div>
      {[...byComposer.entries()].map(([c, ms]) => (
        <Section key={c} title={`Music by ${c}`}><div className={gridCls}>{ms.map((m) => <MovieSoundtrackCard key={m.id} movie={m} />)}</div></Section>
      ))}
    </div>
  );
}
