import { useNavigate, useRouterState, Link } from "@tanstack/react-router";
import { Search, X, Disc3 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Header() {
  const navigate = useNavigate();
  const loc = useRouterState({ select: (s) => s.location });
  const urlQ = loc.pathname === "/search" ? ((loc.search as { q?: string }).q ?? "") : "";
  const [q, setQ] = useState(urlQ);
  const [focus, setFocus] = useState(false);
  useEffect(() => setQ(urlQ), [urlQ]);

  const submit = (v: string) => navigate({ to: "/search", search: { q: v } });

  return (
    <header className="sticky top-0 z-30 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 py-3 lg:grid-cols-1">
      <Link to="/" className="grid h-10 w-10 place-items-center rounded-full bg-amber-gradient text-ink lg:hidden" aria-label="Home"><Disc3 className="h-5 w-5" /></Link>
      <form
        role="search"
        onSubmit={(e) => { e.preventDefault(); submit(q); }}
        className={cn("glass flex h-11 items-center gap-2 rounded-full px-4 transition-all duration-500", focus ? "w-full max-w-2xl glow-active" : "w-full max-w-md")}
      >
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); submit(e.target.value); }}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          placeholder="Search songs, artists, movies, playlists…"
          aria-label="Search music"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {q && (
          <Button variant="ghost" size="icon" type="button" aria-label="Clear search" onClick={() => { setQ(""); submit(""); }} className="h-6 w-6 rounded-full bg-muted hover:bg-accent">
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </form>
    </header>
  );
}
