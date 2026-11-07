import { useState } from "react";
import type { Track } from "@/lib/types";
import { useLibrary } from "@/store/library";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function MusicMetadataEditor({ track, open, onOpenChange }: { track: Track; open: boolean; onOpenChange: (o: boolean) => void }) {
  const { updateTrack, removeTrack } = useLibrary();
  const [f, setF] = useState({ title: track.title, artist: track.artist, movie: track.movie ?? track.album, year: track.year?.toString() ?? "" });
  const field = (k: keyof typeof f, label: string) => (
    <div className="space-y-1.5">
      <Label htmlFor={k}>{label}</Label>
      <Input id={k} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} className="bg-muted" />
    </div>
  );
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong text-foreground" onClick={(e) => e.stopPropagation()}>
        <DialogHeader><DialogTitle>Edit song details</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          {field("title", "Title")}{field("artist", "Artist")}{field("movie", "Movie / Album")}{field("year", "Year")}
          <p className="text-xs text-muted-foreground">File: {track.fileName}</p>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" className="text-destructive" onClick={() => { removeTrack(track.id); onOpenChange(false); }}>Delete song</Button>
          <Button variant="amber" onClick={() => {
            updateTrack(track.id, { title: f.title || track.fileName, artist: f.artist, movie: f.movie || undefined, album: f.movie || "Imported", year: f.year ? Number(f.year) : undefined });
            onOpenChange(false);
          }}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
