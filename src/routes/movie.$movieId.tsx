import { createFileRoute, Link } from "@tanstack/react-router";
import { Play, Shuffle, ArrowLeft } from "lucide-react";
import { useLibrary } from "@/store/library";
import { usePlayer } from "@/store/player";
import { TrackList, EmptyState } from "@/components/music/SongCard";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/queue";

export const Route = createFileRoute("/movie/$movieId")({
  head: ({ params }) => {
    const name = params.movieId.split("-").map((w) => w[0]?.toUpperCase() + w.slice(1)).join(" ");
    return { meta: [
      { title: `${name} — Songs | Tamil Music` },
      { name: "description", content: `Listen to every song from ${name}.` },
      { property: "og:title", content: `${name} — Songs | Tamil Music` },
      { property: "og:description", content: `Listen to every song from ${name}.` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ] };
  },
  component: MoviePage,
});

function MoviePage() {
  const { movieId } = Route.useParams();
  const { movies } = useLibrary();
  const { playList } = usePlayer();
  const movie = movies.find((m) => m.id === movieId);
  if (!movie) return <EmptyState text="This movie isn't in your library." action={<Link to="/" className="text-amber underline">Back home</Link>} />;
  const total = movie.tracks.reduce((s, t) => s + (t.duration ?? 0), 0);

  return (
    <div className="page-in space-y-6">
      <Link to="/albums" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />All movies</Link>
      <section className="glass flex flex-col gap-6 rounded-[2rem] p-5 sm:flex-row sm:items-end sm:p-8">
        <div className="min-w-0 space-y-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-amber">Soundtrack</div>
          <h1 className="text-3xl font-semibold sm:text-5xl">{movie.title}{movie.year ? <span className="text-muted-foreground"> ({movie.year})</span> : null}</h1>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            {movie.hero && (<><dt className="text-muted-foreground">Hero</dt><dd>{movie.hero}</dd></>)}
            {movie.music && (<><dt className="text-muted-foreground">Music</dt><dd>{movie.music}</dd></>)}
            <dt className="text-muted-foreground">Songs</dt><dd>{movie.tracks.length}{total ? ` · ${formatTime(total)}` : ""}</dd>
          </dl>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button variant="amber" className="h-11 px-6" onClick={() => playList(movie.tracks, 0)}><Play className="fill-current" />Play all</Button>
            <Button variant="glass" className="h-11 px-5" onClick={() => playList(movie.tracks, 0, { shuffle: true })}><Shuffle />Shuffle</Button>
          </div>
        </div>
      </section>
      <section className="glass rounded-[2rem] p-3 sm:p-5">
        <h2 className="mb-3 px-2 text-lg font-semibold">Songs</h2>
        <TrackList tracks={movie.tracks} />
      </section>
    </div>
  );
}
