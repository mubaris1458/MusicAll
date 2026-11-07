import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useDebounced, usePaged } from "@/hooks/use-paged";
import { useLibrary } from "@/store/library";
import { TrackList, EmptyState } from "@/components/music/SongCard";
import { MovieSoundtrackCard, PlaylistCard, ArtistCard, Section, gridCls } from "@/components/music/Cards";
import { groupByArtist } from "@/lib/artists";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>) => ({ q: typeof s.q === "string" ? s.q : "" }),
  head: () => ({ meta: [
    { title: "Search — Tamil Music" },
    { name: "description", content: "Search songs, artists, movies and playlists." },
    { property: "og:title", content: "Search — Tamil Music" },
    { property: "og:description", content: "Search songs, artists, movies and playlists." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: SearchPage,
});

const FILTERS = ["All", "Songs", "Artists", "Albums", "Movies", "Recently added"] as const;

function SearchPage() {
  const { q } = Route.useSearch();
  const { tracks, movies, playlists, getTrack } = useLibrary();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const s = useDebounced(q.trim().toLowerCase());
  const has = (v?: string) => !!v && v.toLowerCase().includes(s);

  const songs = useMemo(() => s ? tracks.filter((t) => has(t.title) || has(t.artist) || has(t.album) || has(t.movie)) : tracks, [s, tracks]);
  const mv = useMemo(() => s ? movies.filter((m) => has(m.title) || has(m.music) || has(m.hero)) : movies, [s, movies]);
  const mvPage = usePaged(mv.length, 30, s + filter);
  const pls = s ? playlists.filter((p) => has(p.name) || p.trackIds.some((id) => has(getTrack(id)?.title))) : playlists;
  const artists = useMemo(() => [...groupByArtist(songs, (a, t) => !s || has(a) || has(t.title) || has(t.movie)).entries()].filter(([a]) => !s || has(a)), [songs, s]);
  const recent = useMemo(() => [...songs].sort((a, b) => b.addedAt - a.addedAt).slice(0, 20), [songs]);
  const nothing = !songs.length && !mv.length && !pls.length;

  return (
    <div className="page-in space-y-6">
      <h1 className="text-2xl font-semibold sm:text-3xl">{s ? <>Results for “<span className="text-amber-gradient">{q}</span>”</> : "Search"}</h1>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn("shrink-0 rounded-full px-4 py-1.5 text-sm transition", filter === f ? "bg-amber-gradient font-semibold text-ink" : "glass hover:bg-accent")}>{f}</button>
        ))}
      </div>
      {nothing ? (
        <EmptyState text={`No songs, movies or playlists match “${q}”. Try another spelling, or import your own music.`} action={<Link to="/search" search={{ q: "" }} className="text-sm text-amber underline">Clear search</Link>} />
      ) : (
        <div className="space-y-10">
          {(filter === "All" || filter === "Movies" || filter === "Albums") && mv.length > 0 && (
            <Section title={filter === "Albums" ? "Albums" : "Movie soundtracks"}><div className={gridCls}>{mv.slice(0, mvPage.count).map((m) => <MovieSoundtrackCard key={m.id} movie={m} />)}</div>{mvPage.hasMore && <div ref={mvPage.sentinel} className="h-10" aria-hidden />}</Section>
          )}
          {(filter === "All" || filter === "Songs") && <Section title="Songs"><div className="glass rounded-3xl p-2"><TrackList tracks={songs.slice(0, filter === "All" ? 12 : 200)} empty="No matching songs." /></div></Section>}
          {(filter === "All" || filter === "Artists") && artists.length > 0 && (
            <Section title="Artists"><div className={gridCls}>{artists.slice(0, 10).map(([n, ts]) => <ArtistCard key={n} name={n} tracks={ts} />)}</div></Section>
          )}
          {filter === "All" && pls.length > 0 && <Section title="Playlists"><div className={gridCls}>{pls.map((p) => <PlaylistCard key={p.id} playlist={p} />)}</div></Section>}
          {filter === "Recently added" && <Section title="Recently added"><div className="glass rounded-3xl p-2"><TrackList tracks={recent} /></div></Section>}
        </div>
      )}
    </div>
  );
}
