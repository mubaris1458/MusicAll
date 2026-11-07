import { ListMusic } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { usePlayer } from "@/store/player";
import { Artwork, Visualizer } from "@/components/music/Artwork";
import { formatTime } from "@/lib/queue";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function QueueDrawer() {
  const { queue, order, pos, playing, jumpTo, clearQueue, shuffle } = usePlayer();
  return (
    <Sheet>
      <SheetTrigger aria-label="Open queue" className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground">
        <ListMusic className="h-4 w-4" />
      </SheetTrigger>
      <SheetContent className="glass-strong w-full border-l-0 text-foreground sm:max-w-md">
        <SheetHeader><SheetTitle className="text-foreground">Queue {shuffle && <span className="text-xs text-amber">· shuffled</span>}</SheetTitle></SheetHeader>
        <div className="mt-2 flex-1 space-y-1 overflow-y-auto px-2 pb-4">
          {order.length === 0 && <p className="p-4 text-sm text-muted-foreground">Nothing queued. Pick a movie or song to start.</p>}
          {order.map((qi, p) => {
            const t = queue[qi];
            const active = p === pos;
            return (
              <button key={`${t.id}-${p}`} onClick={() => jumpTo(p)} className={cn("flex w-full items-center gap-3 rounded-2xl p-2 text-left hover:bg-accent", active && "glass glow-active", p < pos && "opacity-50")}>
                <span className="w-5 text-center text-xs text-muted-foreground">{active ? <Visualizer active={playing} /> : p + 1}</span>
                <Artwork src={t.cover} alt={t.title} className="h-10 w-10 rounded-lg" />
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{t.title}</p><p className="truncate text-xs text-muted-foreground">{t.artist}</p></div>
                <span className="text-xs text-muted-foreground">{formatTime(t.duration)}</span>
              </button>
            );
          })}
        </div>
        {order.length > 1 && <div className="p-4"><Button variant="glass" className="w-full" onClick={clearQueue}>Clear queue</Button></div>}
      </SheetContent>
    </Sheet>
  );
}
