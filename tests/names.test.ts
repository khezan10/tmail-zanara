import { describe, expect, it } from "vitest";
import {
  EPITHETS,
  findSeed,
  NAME_SEEDS,
  randomIdentity,
  randomSuffix,
} from "../lib/names";

const LOCAL_RE = /^[a-z]+(?:_[a-z]+)?_[a-z0-9]{10}$/;

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
  it("has a large enough catalogue", () => {
    expect(NAME_SEEDS.length).toBeGreaterThan(190);
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
});

describe("EPITHETS", () => {
  it("has enough modifiers and no duplicates", () => {
    expect(EPITHETS.length).toBeGreaterThan(50);
    const words = EPITHETS.map((s) => s.word);
    expect(new Set(words).size).toBe(words.length);
  });

  it("only contains valid lowercase words", () => {
    for (const epithet of EPITHETS) {
      expect(epithet.word).toMatch(/^[a-z]+$/);
      expect(epithet.meaning.length).toBeGreaterThan(2);
    }
  });
});

describe("randomIdentity", () => {
  it("builds word_suffix or word_epithet_suffix", () => {
    for (let i = 0; i < 50; i += 1) {
      const id = randomIdentity();
      const base = id.epithet ? `${id.word}_${id.epithet.word}` : id.word;
      expect(id.local).toBe(`${base}_${id.suffix}`);
      expect(id.local).toMatch(LOCAL_RE);
      expect(id.local.length).toBeLessThanOrEqual(64);
    }
  });

  it("accepts a specific seed", () => {
    const seed = findSeed("anthropos");
    expect(seed).toBeDefined();
    const id = randomIdentity(seed);
    expect(id.word).toBe("anthropos");
    expect(id.local.startsWith("anthropos")).toBe(true);
    expect(id.local).toMatch(/^anthropos(?:_[a-z]+)?_[a-z0-9]{10}$/);
  });

  it("produces thousands of distinct combinations", () => {
    const seen = new Set<string>();
    const bases = new Set<string>();
    for (let i = 0; i < 2000; i += 1) {
      const id = randomIdentity();
      seen.add(id.local);
      bases.add(id.epithet ? `${id.word}_${id.epithet.word}` : id.word);
    }
    expect(seen.size).toBeGreaterThan(1990);
    expect(bases.size).toBeGreaterThan(500);
  });
});

describe("findSeed", () => {
  it("finds by word and by full address", () => {
    expect(findSeed("logos")?.meaning).toBe("word, reason");
    expect(findSeed("logos_abc1234567")?.word).toBe("logos");
    expect(findSeed("anthropos_eudaimon_abc1234567")?.word).toBe("anthropos");
  });

  it("returns undefined for unknown words", () => {
    expect(findSeed("notaword")).toBeUndefined();
  });
});
