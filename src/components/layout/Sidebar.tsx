import { Link } from "@tanstack/react-router";
import { Home, Compass, ListMusic, Disc3, Mic2, History, Download, Search } from "lucide-react";

export const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/playlists", label: "Playlists", icon: ListMusic },
  { to: "/albums", label: "Albums", icon: Disc3 },
  { to: "/artists", label: "Artists", icon: Mic2 },
  { to: "/recent", label: "Recently Played", icon: History },
  { to: "/downloads", label: "Downloads", icon: Download },
] as const;

export function Sidebar() {
  return (
    <aside className="glass sticky top-4 hidden h-[calc(100vh-7.5rem)] w-60 shrink-0 flex-col rounded-3xl p-4 lg:flex">
      <Link to="/" className="mb-6 flex items-center gap-2 px-2">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-amber-gradient text-ink shadow-[var(--shadow-glow)]"><Disc3 className="h-5 w-5" /></span>
        <span className="font-display text-lg font-semibold">Amber<span className="text-amber-gradient">Wave</span></span>
      </Link>
      <nav className="flex flex-col gap-1">
        {NAV.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === "/" }}
            className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground data-[status=active]:bg-amber-gradient data-[status=active]:font-semibold data-[status=active]:text-ink"
          >
            <Icon className="h-4 w-4" />{label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export function MobileNav() {
  const items = [
    { to: "/", label: "Home", icon: Home },
    { to: "/search", label: "Search", icon: Search },
    { to: "/playlists", label: "Playlists", icon: ListMusic },
  ] as const;
  return (
    <nav className="glass-strong fixed inset-x-3 bottom-3 z-40 grid grid-cols-3 rounded-3xl p-1.5 lg:hidden">
      {items.map(({ to, label, icon: Icon }) => (
        <Link key={to} to={to} search={to === "/search" ? { q: "" } : undefined} activeOptions={{ exact: to === "/" }} className="flex flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[11px] text-muted-foreground data-[status=active]:bg-accent data-[status=active]:text-amber">
          <Icon className="h-5 w-5" />{label}
        </Link>
      ))}
    </nav>
  );
}
