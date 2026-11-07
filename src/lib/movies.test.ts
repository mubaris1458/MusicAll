import { describe, expect, it } from "vitest";
import { STANDALONE_TRACKS } from "@/data/standalone-songs";
import { groupMovies } from "./movies";

describe("standalone songs", () => {
  it("keeps the attached Vizhi Veekura playable without creating a movie", () => {
    const track = STANDALONE_TRACKS.find((t) => t.title === "Vizhi Veekura");
    expect(track).toBeDefined();
    if (!track) throw new Error("Attached song missing");
    expect(track.src).toMatch(/\/Vizhi_Veekura\.mp3$/);
    expect(track.duration).toBeCloseTo(219.8, 1);
    expect(track.standalone).toBe(true);
    expect(track.movie).toBeUndefined();
    const soundtrack = { ...track, id: "movie-track", standalone: false, movie: "Thug Life" };
    expect(groupMovies([track, soundtrack]).map((movie) => ({ title: movie.title, ids: movie.tracks.map((t) => t.id) })))
      .toEqual([{ title: "Thug Life", ids: ["movie-track"] }]);
  });
});