import { createFileRoute } from "@tanstack/react-router";
import { useLibrary } from "@/store/library";
import { ArtistCard, gridCls } from "@/components/music/Cards";
import { useMemo } from "react";
import { groupByArtist } from "@/lib/artists";
import { usePaged } from "@/hooks/use-paged";

export const Route = createFileRoute("/artists")({
  head: () => ({ meta: [
    { title: "Artists — AmberWave" },
    { name: "description", content: "Browse singers and composers in your library." },
    { property: "og:title", content: "Artists — AmberWave" },
    { property: "og:description", content: "Browse singers and composers in your library." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Artists,
});

function Artists() {
  const { tracks } = useLibrary();
  const list = useMemo(() => [...groupByArtist(tracks).entries()].sort((a, b) => a[0].localeCompare(b[0])), [tracks]);
  const { count, sentinel, hasMore } = usePaged(list.length, 40);
  return (
    <div className="page-in space-y-6">
      <h1 className="text-3xl font-semibold">Artists</h1>
      <div className={gridCls}>{list.slice(0, count).map(([n, ts]) => <ArtistCard key={n} name={n} tracks={ts} />)}</div>
      {hasMore && <div ref={sentinel} className="h-10" aria-hidden />}
    </div>
  );
}
