import { describe, expect, it } from "vitest";
import { composeIdentity, EPITHETS, NAME_SEEDS, randomPick } from "../lib/names";

describe("composeIdentity", () => {
  it("builds root_suffix", () => {
    const root = NAME_SEEDS[0];
    const id = composeIdentity(root);
    expect(id.local).toBe(`${root.word}_${id.suffix}`);
    expect(id.local).toMatch(/^[a-z]+_[a-z0-9]{10}$/);
    expect(id.epithet).toBeUndefined();
    expect(id.meaning).toBe(root.meaning);
  });

  it("builds root_epithet_suffix when an epithet is given", () => {
    const root = NAME_SEEDS.find((s) => s.word === "anthropos")!;
    const epithet = EPITHETS.find((s) => s.word === "eudaimon")!;
    const id = composeIdentity(root, epithet);
    expect(id.local).toMatch(/^anthropos_eudaimon_[a-z0-9]{10}$/);
    expect(id.epithet?.meaning).toBe("flourishing, blessed");
    expect(id.local.length).toBeLessThanOrEqual(64);
  });
});

describe("randomPick", () => {
  it("always returns an element of the array", () => {
    const pool = ["a", "b", "c"];
    for (let i = 0; i < 50; i += 1) expect(pool).toContain(randomPick(pool));
  });
});
