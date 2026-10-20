import { describe, expect, it } from "vitest";
import {
  isValidDomain,
  isValidLocalPart,
  isReservedDomain,
  normalizeDomain,
  randomLocalPart,
  splitAddress,
} from "../lib/validate";

describe("normalizeDomain", () => {
  it("strips protocol, www, path and trailing dot", () => {
    expect(normalizeDomain("https://www.Example.COM/path?x=1")).toBe("example.com");
    expect(normalizeDomain("  Example.com. ")).toBe("example.com");
  });
});

describe("isValidDomain", () => {
  it("accepts normal domains", () => {
    expect(isValidDomain("example.com")).toBe(true);
    expect(isValidDomain("mail.example.co.id")).toBe(true);
    expect(isValidDomain("a-b.example.io")).toBe(true);
  });

  it("rejects malformed domains", () => {
    expect(isValidDomain("localhost")).toBe(false);
    expect(isValidDomain("-bad.com")).toBe(false);
    expect(isValidDomain("bad-.com")).toBe(false);
    expect(isValidDomain("exa mple.com")).toBe(false);
  });
});

describe("reserved domains", () => {
  it("blocks deployment-owned domains", () => {
    expect(isReservedDomain("mzg.my.id")).toBe(true);
    expect(isReservedDomain("link.mzg.my.id")).toBe(true);
    expect(isReservedDomain("someone-else.dev")).toBe(false);
  });
});

describe("splitAddress", () => {
  it("splits on the last @", () => {
    expect(splitAddress("hello@example.com")).toEqual({ local: "hello", domain: "example.com" });
    expect(splitAddress("a@b@example.com")).toEqual({ local: "a@b", domain: "example.com" });
  });

  it("rejects addresses without both parts", () => {
    expect(splitAddress("hello")).toBeNull();
    expect(splitAddress("@example.com")).toBeNull();
    expect(splitAddress("hello@")).toBeNull();
  });
});

describe("local part", () => {
  it("validates characters and length", () => {
    expect(isValidLocalPart("john.doe")).toBe(true);
    expect(isValidLocalPart("a_b-c1")).toBe(true);
    expect(isValidLocalPart(".leading")).toBe(false);
    expect(isValidLocalPart("trailing.")).toBe(false);
    expect(isValidLocalPart("has space")).toBe(false);
    expect(isValidLocalPart("x".repeat(65))).toBe(false);
  });
});

describe("randomLocalPart", () => {
  it("returns lowercase alphanumerics of the requested length", () => {
    const value = randomLocalPart(12);
    expect(value).toHaveLength(12);
    expect(value).toMatch(/^[a-z0-9]+$/);
    expect(randomLocalPart(10)).not.toBe(value);
  });
});
