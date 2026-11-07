import { describe, it, expect } from "vitest";
import { buildOrder, continuation, nextPos, prevPos } from "./queue";

const t = (id: string, movie: string, artist = "Singer") => ({ id, artist, movie, album: movie });

describe("queue", () => {
  it("shuffle keeps current first and contains every track once", () => {
    const o = buildOrder(10, 4, true);
    expect(o[0]).toBe(4);
    expect([...o].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
  it("shuffle never picks the current track as next when alternatives exist", () => {
    for (let i = 0; i < 50; i++) expect(buildOrder(5, 2, true)[1]).not.toBe(2);
  });
  it("next stops at end unless repeat all", () => {
    expect(nextPos(4, 5, "off")).toBe(-1);
    expect(nextPos(4, 5, "all")).toBe(0);
    expect(nextPos(1, 5, "off")).toBe(2);
  });
  it("previous wraps only on repeat all", () => {
    expect(prevPos(0, 5, "off")).toBe(0);
    expect(prevPos(0, 5, "all")).toBe(4);
  });
});

describe("continuation", () => {
  const a = t("a", "Dorothy", "Arun");
  const b = t("b", "Gana Songs", "Other");
  const c = t("c", "Dorothy", "Arun");
  const d = t("d", "Thug Life", "Someone");

  it("puts same-movie or same-artist songs first", () => {
    expect(continuation([a, b, c, d], [a], a).map((x) => x.id)).toEqual(["c", "b", "d"]);
  });
  it("never repeats a song that already played", () => {
    expect(continuation([a, b, c], [a, c], c).map((x) => x.id)).toEqual(["b"]);
  });
  it("respects the limit", () => {
    expect(continuation([a, b, c, d], [a], a, 1).map((x) => x.id)).toEqual(["c"]);
  });
  it("returns nothing when the whole library has played", () => {
    expect(continuation([a, b], [a, b], b)).toEqual([]);
  });
});
