import { usePlayer, usePlayerTime } from "@/store/player";
import { formatTime } from "@/lib/queue";
import { cn } from "@/lib/utils";

export function PlayerProgressBar({ compact, className }: { compact?: boolean; className?: string }) {
  const { duration, seek, current } = usePlayer();
  const time = usePlayerTime();
  const pct = duration ? (time / duration) * 100 : 0;
  return (
    <div className={cn("flex w-full items-center gap-2 text-[11px] tabular-nums text-muted-foreground", className)}>
      {!compact && <span className="w-9 text-right">{formatTime(time)}</span>}
      <input
        type="range" min={0} max={duration || 0} step={0.1} value={time}
        disabled={!current}
        onChange={(e) => seek(Number(e.target.value))}
        aria-label="Seek"
        aria-valuetext={`${formatTime(time)} of ${formatTime(duration)}`}
        className="amber-range flex-1"
        style={{ ["--pct" as string]: `${pct}%` }}
      />
      {!compact && <span className="w-9">{formatTime(duration)}</span>}
    </div>
  );
}
