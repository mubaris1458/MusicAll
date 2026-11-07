import { useRef, useState } from "react";
import { Upload, FileAudio, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLibrary } from "@/store/library";
import { usePlayer } from "@/store/player";
import { SUPPORTED } from "@/lib/metadata";
import type { Track } from "@/lib/types";
import { Artwork } from "./Artwork";

export function ImportMusicDialog() {
  const { importFiles } = useLibrary();
  const { playList } = usePlayer();
  const navigate = useNavigate();
  const input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<{ done: number; total: number } | null>(null);
  const [added, setAdded] = useState<Track[]>([]);
  const [drag, setDrag] = useState(false);

  const handle = async (list: FileList | null) => {
    if (!list) return;
    const all = [...list];
    const files = all.filter((f) => f.type.startsWith("audio/") || SUPPORTED.test(f.name));
    if (all.length > files.length) toast.warning(`${all.length - files.length} file(s) skipped — not audio.`);
    if (!files.length) return;
    setBusy({ done: 0, total: files.length });
    const res = await importFiles(files, (done) => setBusy({ done, total: files.length }));
    setBusy(null); setAdded(res);
    toast.success(`Imported ${res.length} song${res.length > 1 ? "s" : ""}`);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setAdded([]); }}>
      <DialogTrigger asChild>
        <Button variant="amber" className="h-11 px-4"><Upload /><span className="hidden sm:inline">Import Music</span></Button>
      </DialogTrigger>
      <DialogContent className="glass-strong max-h-[85vh] overflow-y-auto text-foreground">
        <DialogHeader>
          <DialogTitle>Import music</DialogTitle>
          <DialogDescription className="text-muted-foreground">MP3, WAV, M4A, OGG and more. We read title, artist, album, duration and cover art. Files stay on this device.</DialogDescription>
        </DialogHeader>
        <button
          onClick={() => input.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files); }}
          disabled={!!busy}
          className={`flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed p-8 transition ${drag ? "border-amber bg-accent" : "border-border hover:bg-muted"}`}
        >
          {busy ? <Loader2 className="h-10 w-10 animate-spin text-amber" /> : <FileAudio className="h-10 w-10 text-amber" />}
          <span className="font-semibold">{busy ? `Analyzing ${busy.done}/${busy.total}…` : "Choose files or drop them here"}</span>
        </button>
        <input ref={input} type="file" accept="audio/*,.mp3,.wav,.m4a,.ogg,.flac" multiple hidden onChange={(e) => { handle(e.target.files); e.target.value = ""; }} />
        {added.length > 0 && (
          <div className="space-y-2">
            {added.map((t) => (
              <div key={t.id} className="flex items-center gap-3 rounded-2xl bg-muted p-2">
                <Artwork src={t.cover} alt={t.title} className="h-10 w-10 rounded-lg" />
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{t.title}</p><p className="truncate text-xs text-muted-foreground">{t.artist} · {t.album}</p></div>
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Button variant="amber" onClick={() => { playList(added, 0); setOpen(false); }}>Play now</Button>
              <Button variant="glass" onClick={() => { setOpen(false); navigate({ to: "/library" }); }}>Open library</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
