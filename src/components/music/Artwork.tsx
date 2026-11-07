import { Music2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Artwork({ src, alt, className, spin }: { src?: string; alt: string; className?: string; spin?: boolean }) {
  return (
    <div className={cn("relative overflow-hidden bg-amber-gradient", className, spin && "vinyl-spin rounded-full")}>
      {src ? (
        <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <div className="grid h-full w-full place-items-center text-ink/70"><Music2 className="h-1/3 w-1/3" /></div>
      )}
      {spin && <div className="absolute left-1/2 top-1/2 h-[18%] w-[18%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-background" />}
    </div>
  );
}

export function Visualizer({ active, className }: { active: boolean; className?: string }) {
  return (
    <div className={cn("flex h-4 items-end gap-[2px]", className)} aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className={cn("w-[3px] rounded-full bg-amber-gradient", active ? "wave-bar" : "h-1")} style={active ? { height: "100%", animationDelay: `${i * 0.15}s` } : undefined} />
      ))}
    </div>
  );
}

export function SourceBadge({ source }: { source: "drive" | "imported" }) {
  if (source === "imported") return null;
  return (
    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      Drive
    </span>
  );
}
