import { createFileRoute, Outlet, useMatch } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useLibrary } from "@/store/library";
import { PlaylistCard, gridCls } from "@/components/music/Cards";
import { EmptyState } from "@/components/music/SongCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/playlists")({
  head: () => ({ meta: [
    { title: "Playlists — AmberWave" },
    { name: "description", content: "Create and manage your playlists." },
    { property: "og:title", content: "Playlists — AmberWave" },
    { property: "og:description", content: "Create and manage your playlists." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: PlaylistsLayout,
});

function PlaylistsLayout() {
  const child = useMatch({ from: "/playlists/$playlistId", shouldThrow: false });
  return child ? <Outlet /> : <Playlists />;
}

function Playlists() {
  const { playlists, createPlaylist } = useLibrary();
  const [name, setName] = useState("");
  return (
    <div className="page-in space-y-6">
      <h1 className="text-3xl font-semibold">Playlists</h1>
      <form onSubmit={(e) => { e.preventDefault(); createPlaylist(name.trim()); setName(""); }} className="glass flex gap-2 rounded-full p-1.5 pl-4">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="New playlist name" aria-label="New playlist name" className="h-10 border-0 bg-transparent shadow-none focus-visible:ring-0" />
        <Button type="submit" variant="amber" className="h-10 px-5"><Plus />Create</Button>
      </form>
      {playlists.length ? <div className={gridCls}>{playlists.map((p) => <PlaylistCard key={p.id} playlist={p} />)}</div>
        : <EmptyState text="No playlists yet. Name one above, then add songs from any song’s ••• menu." />}
    </div>
  );
}
