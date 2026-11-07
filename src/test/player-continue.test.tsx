import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Track } from "@/lib/types";

const LIB = vi.hoisted(() => ({ tracks: [] as Track[], pushRecent: vi.fn() }));

vi.mock("@/store/library", () => ({
  useLibrary: () => ({ tracks: LIB.tracks, pushRecent: LIB.pushRecent }),
}));

class FakeAudio {
  src = "";
  paused = true;
  currentTime = 0;
  duration = 0;
  volume = 1;
  muted = false;
  preload = "";
  crossOrigin = "";
  private listeners: Record<string, (() => void)[]> = {};
  addEventListener(ev: string, fn: () => void) { (this.listeners[ev] ??= []).push(fn); }
  emit(ev: string) { for (const fn of this.listeners[ev] ?? []) fn(); }
  play() { this.paused = false; return Promise.resolve(); }
  pause() { this.paused = true; }
}

const made: FakeAudio[] = [];
vi.stubGlobal("Audio", function () { const a = new FakeAudio(); made.push(a); return a; });

import { PlayerProvider, usePlayer } from "@/store/player";

let api: ReturnType<typeof usePlayer> | null = null;
function Harness() {
  api = usePlayer();
  return (
    <div>
      <span data-testid="src">{api.current?.src ?? "none"}</span>
      <span data-testid="olen">{api.order.length}</span>
    </div>
  );
}

const mk = (id: string, movie: string, artist = "Singer"): Track =>
  ({ id, title: id, artist, album: movie, movie, src: `/${id}`, source: "drive", addedAt: 1 });

const show = () => render(<PlayerProvider><Harness /></PlayerProvider>);

beforeEach(() => { made.length = 0; LIB.pushRecent.mockClear(); });
afterEach(() => { cleanup(); LIB.tracks = []; });

describe("auto-continue when a song ends", () => {
  it("plays the next song already in the queue", () => {
    const a = mk("a", "Dorothy"), b = mk("b", "Dorothy");
    LIB.tracks = [a, b];
    show();
    act(() => api!.playList([a, b], 0));
    const audio = made[0];
    expect(audio.src).toBe("/a");
    act(() => audio.emit("ended"));
    expect(audio.src).toBe("/b");
  });

  it("keeps playing after the last queued song instead of stopping", () => {
    const a = mk("a", "Dorothy"), b = mk("b", "Gana Songs"), c = mk("c", "Gana Songs");
    LIB.tracks = [a, b, c];
    show();
    act(() => api!.playList([a], 0));
    const audio = made[0];
    expect(audio.src).toBe("/a");
    act(() => audio.emit("ended"));
    expect(audio.src).toBe("/b");
    expect(screen.getByTestId("olen").textContent).toBe("3");
    expect(LIB.pushRecent).toHaveBeenCalledWith("b");
  });

  it("prefers a song from the same movie over an unrelated one", () => {
    const a = mk("a", "Dorothy", "Arun"), b = mk("b", "Gana Songs", "Other"), c = mk("c", "Dorothy", "Arun");
    LIB.tracks = [a, b, c];
    show();
    act(() => api!.playList([a], 0));
    const audio = made[0];
    act(() => audio.emit("ended"));
    expect(audio.src).toBe("/c");
  });

  it("stops when every song has already played", () => {
    const a = mk("a", "Dorothy");
    LIB.tracks = [a];
    show();
    act(() => api!.playList([a], 0));
    const audio = made[0];
    act(() => audio.emit("ended"));
    expect(audio.src).toBe("/a");
    expect(screen.getByTestId("olen").textContent).toBe("1");
  });
});
