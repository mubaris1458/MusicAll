import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useDebounced, usePaged } from "@/hooks/use-paged";
import { useLibrary } from "@/store/library";
import { MovieSoundtrackCard, gridCls } from "@/components/music/Cards";
import { EmptyState } from "@/components/music/SongCard";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/albums")({
  head: () => ({ meta: [
    { title: "All Movies — AmberWave" },
    { name: "description", content: "Every Tamil movie soundtrack in your collection." },
    { property: "og:title", content: "All Movies — AmberWave" },
    { property: "og:description", content: "Every Tamil movie soundtrack in your collection." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Albums,
});

function Albums() {
  const { movies } = useLibrary();
  const [q, setQ] = useState("");
  const dq = useDebounced(q.trim().toLowerCase());
  const list = useMemo(() => (dq ? movies.filter((m) => m.title.toLowerCase().includes(dq)) : movies), [movies, dq]);
  const { count, sentinel, hasMore } = usePaged(list.length, 40, dq);
  return (
    <div className="page-in space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-3xl font-semibold">All Movies <span className="text-base text-muted-foreground">({movies.length})</span></h1>
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a movie…" aria-label="Find a movie" className="glass h-10 max-w-xs rounded-full border-0" />
      </div>
      {list.length ? <><div className={gridCls}>{list.slice(0, count).map((m) => <MovieSoundtrackCard key={m.id} movie={m} />)}</div>{hasMore && <div ref={sentinel} className="h-10" aria-hidden />}</> : <EmptyState text={`No movie named “${q}”.`} />}
    </div>
  );
}
