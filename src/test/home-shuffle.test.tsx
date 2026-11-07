import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Track } from "@/lib/types";

const { playList, tracks } = vi.hoisted(() => ({
  playList: vi.fn(),
  tracks: [
    { id: "first", title: "First", artist: "Singer", album: "10 Endrathukulla", movie: "10 Endrathukulla", src: "/first", source: "drive", addedAt: 1 },
    { id: "second", title: "Second", artist: "Singer", album: "Another movie", movie: "Another movie", src: "/second", source: "drive", addedAt: 2 },
  ] as Track[],
}));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: { component: () => React.ReactNode }) => ({ options }),
  Link: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));
vi.mock("@/store/player", () => ({ usePlayer: () => ({ playList }) }));
vi.mock("@/store/library", () => ({ useLibrary: () => ({
  tracks, movies: tracks.map((t) => ({ id: t.id, title: t.movie, tracks: [t] })),
  playlists: [], recent: [], getTrack: () => undefined,
}) }));
vi.mock("@/components/music/Cards", () => ({
  MovieSoundtrackCard: () => null, PlaylistCard: () => null, ArtistCard: () => null,
  Section: ({ children }: { children: React.ReactNode }) => <section>{children}</section>, gridCls: "",
}));

import { Route } from "@/routes/index";

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("Home shuffle", () => {
  it("immediately starts shuffled playback from all movies, not just 10 Endrathukulla", () => {
    const Home = Route.options.component;
    if (!Home) throw new Error("Home is missing");
    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: "Shuffle" }));
    expect(playList).toHaveBeenCalledWith(tracks, 0, { shuffle: true });
    expect(playList.mock.calls[0][0].map((t: Track) => t.movie)).toEqual(["10 Endrathukulla", "Another movie"]);
  });
});