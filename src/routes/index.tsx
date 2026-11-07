import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { groupByArtist } from "@/lib/artists";
import { Shuffle } from "lucide-react";
import { useLibrary } from "@/store/library";
import { usePlayer } from "@/store/player";
import { MovieSoundtrackCard, PlaylistCard, ArtistCard, Section, gridCls } from "@/components/music/Cards";
import { Button } from "@/components/ui/button";
import { slug, type Movie } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AmberWave — Your music, your atmosphere" },
      { name: "description", content: "Movie soundtracks, playlists and your own imported music in a warm amber glass player." },
      { property: "og:title", content: "AmberWave — Your music, your atmosphere" },
      { property: "og:description", content: "Movie soundtracks, playlists and your own imported music." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const { movies, playlists, recent, getTrack, tracks } = useLibrary();
  const { playList } = usePlayer();

  const recentMovies = useMemo(() => {
    const byId = new Map(movies.map((m) => [m.id, m]));
    const out: Movie[] = [];
    for (const id of recent) {
      const t = getTrack(id); if (!t) continue;
      const m = byId.get(slug(t.movie || t.album || "Imported"));
      if (m && !out.includes(m)) out.push(m);
    }
    return out;
  }, [recent, movies, getTrack]);
  const popular = useMemo(() => [...movies].sort((a, b) => b.tracks.length - a.tracks.length).slice(0, 5), [movies]);
  const newReleases = useMemo(() => [...movies].sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || b.tracks[0].addedAt - a.tracks[0].addedAt).slice(0, 5), [movies]);
  const topArtists = useMemo(() => [...groupByArtist(tracks).entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 5), [tracks]);

  return (
    <div className="page-in space-y-10">
      <section className="glass relative overflow-hidden rounded-[2rem] p-6 sm:p-10">
        <div className="relative max-w-xl space-y-4">
          <p className="text-sm text-amber">Good to see you</p>
          <h1 className="text-3xl font-semibold leading-tight sm:text-5xl">Your music,<br /><span className="text-amber-gradient">your atmosphere.</span></h1>
          <p className="text-sm text-muted-foreground">{movies.length} movies · {tracks.length} songs</p>
          <Button variant="amber" className="h-11 px-6" disabled={!tracks.length} onClick={() => playList(tracks, 0, { shuffle: true })}><Shuffle />Shuffle</Button>
        </div>
      </section>

      {recentMovies.length > 0 && (
        <Section title="Recently Played"><div className={gridCls}>{recentMovies.slice(0, 5).map((m) => <MovieSoundtrackCard key={m.id} movie={m} />)}</div></Section>
      )}
      <Section title="Popular Soundtracks" action={<Link to="/albums" className="text-sm text-amber hover:underline">See all</Link>}>
        <div className={gridCls}>{popular.slice(0, 5).map((m) => <MovieSoundtrackCard key={m.id} movie={m} />)}</div>
      </Section>
      <Section title="New Releases">
        <div className={gridCls}>{newReleases.slice(0, 5).map((m) => <MovieSoundtrackCard key={m.id} movie={m} />)}</div>
      </Section>
      <Section title="Your Playlists" action={<Link to="/playlists" className="text-sm text-amber hover:underline">Manage</Link>}>
        {playlists.length ? <div className={gridCls}>{playlists.slice(0, 5).map((p) => <PlaylistCard key={p.id} playlist={p} />)}</div>
          : <p className="glass rounded-3xl p-6 text-sm text-muted-foreground">No playlists yet. <Link to="/playlists" className="text-amber underline">Create your first one</Link>.</p>}
      </Section>
      <Section title="Artists" action={<Link to="/artists" className="text-sm text-amber hover:underline">See all</Link>}>
        <div className={gridCls}>{topArtists.map(([n, ts]) => <ArtistCard key={n} name={n} tracks={ts} />)}</div>
      </Section>
    </div>
  );
}
