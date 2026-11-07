import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Play, Shuffle, Pencil, Trash2, ArrowLeft, Check } from "lucide-react";
import { useLibrary } from "@/store/library";
import { usePlayer } from "@/store/player";
import { TrackList, EmptyState } from "@/components/music/SongCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import type { Track } from "@/lib/types";

export const Route = createFileRoute("/playlists/$playlistId")({
  head: () => ({ meta: [
    { title: "Playlist — AmberWave" },
    { name: "description", content: "Play, shuffle and reorder your playlist." },
    { property: "og:title", content: "Playlist — AmberWave" },
    { property: "og:description", content: "Play, shuffle and reorder your playlist." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: PlaylistPage,
});

function PlaylistPage() {
  const { playlistId } = Route.useParams();
  const { playlists, getTrack, renamePlaylist, deletePlaylist, removeFromPlaylist, moveInPlaylist } = useLibrary();
  const { playList } = usePlayer();
  const navigate = useNavigate();
  const p = playlists.find((x) => x.id === playlistId);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(p?.name ?? "");
  if (!p) return <EmptyState text="Playlist not found." action={<Link to="/playlists" className="text-amber underline">All playlists</Link>} />;
  const tracks = p.trackIds.map(getTrack).filter(Boolean) as Track[];

  return (
    <div className="page-in space-y-6">
      <Link to="/playlists" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Playlists</Link>
      <section className="glass space-y-4 rounded-[2rem] p-6">
        {editing ? (
          <form onSubmit={(e) => { e.preventDefault(); renamePlaylist(p.id, name.trim() || p.name); setEditing(false); }} className="flex gap-2">
            <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} aria-label="Playlist name" className="h-11 bg-muted text-lg" />
            <Button type="submit" variant="amber" size="icon" className="h-11 w-11" aria-label="Save name"><Check /></Button>
          </form>
        ) : <h1 className="text-3xl font-semibold sm:text-4xl">{p.name}</h1>}
        <p className="text-sm text-muted-foreground">{tracks.length} songs</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="amber" className="h-11 px-6" disabled={!tracks.length} onClick={() => playList(tracks, 0)}><Play className="fill-current" />Play</Button>
          <Button variant="glass" className="h-11 px-5" disabled={!tracks.length} onClick={() => playList(tracks, 0, { shuffle: true })}><Shuffle />Shuffle</Button>
          <Button variant="glass" className="h-11 px-5" onClick={() => { setName(p.name); setEditing(true); }}><Pencil />Rename</Button>
          <AlertDialog>
            <AlertDialogTrigger asChild><Button variant="glass" className="h-11 px-5 text-destructive"><Trash2 />Delete</Button></AlertDialogTrigger>
            <AlertDialogContent className="glass-strong text-foreground">
              <AlertDialogHeader><AlertDialogTitle>Delete “{p.name}”?</AlertDialogTitle><AlertDialogDescription className="text-muted-foreground">The songs stay in your library. This can’t be undone.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-transparent">Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => { deletePlaylist(p.id); navigate({ to: "/playlists" }); }}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>
      <div className="glass rounded-3xl p-2">
        <TrackList tracks={tracks} empty="This playlist is empty. Use the ••• menu on any song to add it." onRemove={(t) => removeFromPlaylist(p.id, t.id)} onMove={(i, d) => moveInPlaylist(p.id, i, i + d)} />
      </div>
    </div>
  );
}
