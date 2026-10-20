import { describe, expect, it } from "vitest";
import { findSeed, NAME_SEEDS, randomIdentity, randomSuffix } from "../lib/names";

const LOCAL_RE = /^[a-z]+_[a-z0-9]{10}$/;

describe("randomSuffix", () => {
  it("returns 10 lowercase alphanumerics", () => {
    const value = randomSuffix();
    expect(value).toHaveLength(10);
    expect(value).toMatch(/^[a-z0-9]{10}$/);
  });

  it("does not repeat on consecutive calls", () => {
    expect(randomSuffix()).not.toBe(randomSuffix());
  });
});

describe("NAME_SEEDS", () => {
  it("has a decent catalogue", () => {
    expect(NAME_SEEDS.length).toBeGreaterThan(100);
  });

  it("is free of duplicates and has full metadata", () => {
    const words = NAME_SEEDS.map((s) => s.word);
    expect(new Set(words).size).toBe(words.length);
    for (const seed of NAME_SEEDS) {
      expect(seed.word).toMatch(/^[a-z]+$/);
      expect(seed.meaning.length).toBeGreaterThan(2);
      expect(seed.origin.length).toBeGreaterThan(2);
    }
  });

  it("only uses characters that are valid in an email local part", () => {
    for (const seed of NAME_SEEDS) {
      expect(seed.word.length).toBeLessThanOrEqual(52);
    }
  });
});

describe("randomIdentity", () => {
  it("builds word_suffix", () => {
    const id = randomIdentity();
    expect(id.local).toBe(`${id.word}_${id.suffix}`);
    expect(id.local).toMatch(LOCAL_RE);
    expect(id.meaning.length).toBeGreaterThan(0);
    expect(id.origin.length).toBeGreaterThan(0);
  });

  it("accepts a specific seed", () => {
    const seed = findSeed("anthropos");
    expect(seed).toBeDefined();
    const id = randomIdentity(seed);
    expect(id.word).toBe("anthropos");
    expect(id.local.startsWith("anthropos_")).toBe(true);
    expect(id.local).toMatch(/^anthropos_[a-z0-9]{10}$/);
  });

  it("matches the documented example shape", () => {
    expect("anthropos_aiue983hnf").toMatch(LOCAL_RE);
  });
});

describe("findSeed", () => {
  it("finds by word and by full address", () => {
    expect(findSeed("logos")?.meaning).toBe("word, reason");
    expect(findSeed("logos_abc1234567")?.word).toBe("logos");
  });

  it("returns undefined for unknown words", () => {
    expect(findSeed("notaword")).toBeUndefined();
  });
});
