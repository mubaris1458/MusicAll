import { Download } from "lucide-react";
import { toast } from "sonner";
import type { Track } from "@/lib/types";
import { useLibrary } from "@/store/library";
import { cn } from "@/lib/utils";

export function DownloadButton({ track, className }: { track: Track; className?: string }) {
  const { markDownloaded, downloaded } = useLibrary();
  const done = downloaded.includes(track.id);
  const go = async () => {
    const name = track.fileName || `${track.artist} - ${track.title}.mp3`;
    try {
      const blob = await (await fetch(track.src)).blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch {
      window.open(track.src, "_blank", "noopener");
    }
    markDownloaded(track.id);
    toast.success(`Downloading "${track.title}"`);
  };
  return (
    <button onClick={(e) => { e.stopPropagation(); go(); }} aria-label={`Download ${track.title}`} className={cn("grid h-9 w-9 place-items-center rounded-full transition hover:bg-accent", done ? "text-amber" : "text-muted-foreground", className)}>
      <Download className="h-4 w-4" />
    </button>
  );
}
