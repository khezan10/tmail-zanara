import { afterEach, describe, expect, it, vi } from "vitest";
import { checkDomain, dohLookup } from "../lib/dns";

function mockDoh(map: Record<string, string[]>) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      const key = url.includes("type=MX") ? "MX" : "TXT";
      const answer = (map[key] || []).map((data) => ({ data }));
      return {
        ok: true,
        json: async () => ({ Answer: answer }),
      } as unknown as Response;
    })
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("dohLookup", () => {
  it("flattens answer data", async () => {
    mockDoh({ TXT: ['"hello"'] });
    await expect(dohLookup("_tmail.example.com", "TXT")).resolves.toEqual(['"hello"']);
  });

  it("throws when the resolver fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false }) as Response));
    await expect(dohLookup("example.com", "MX")).rejects.toThrow("DOH_FAILED");
  });
});

describe("checkDomain", () => {
  it("passes when MX points at Cloudflare and the TXT token matches", async () => {
    mockDoh({
      MX: ["10 route1.mx.cloudflare.net.", "20 route2.mx.cloudflare.net."],
      TXT: ['"tmail-verify=abc123"'],
    });
    const result = await checkDomain("example.com", "abc123");
    expect(result).toMatchObject({ mxOk: true, txtOk: true, ok: true });
  });

  it("fails when the token does not match", async () => {
    mockDoh({
      MX: ["10 route1.mx.cloudflare.net."],
      TXT: ['"tmail-verify=other"'],
    });
    const result = await checkDomain("example.com", "abc123");
    expect(result).toMatchObject({ mxOk: true, txtOk: false, ok: false });
  });

  it("fails when MX is not Cloudflare Email Routing", async () => {
    mockDoh({
      MX: ["10 mail.example.com."],
      TXT: ['"tmail-verify=abc123"'],
    });
    const result = await checkDomain("example.com", "abc123");
    expect(result).toMatchObject({ mxOk: false, txtOk: true, ok: false });
  });
});
