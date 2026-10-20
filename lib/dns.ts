const DOH = "https://cloudflare-dns.com/dns-query";

export type RecordType = "TXT" | "MX";

/** DNS over HTTPS lookup (Cloudflare JSON API). Returns flattened record data. */
export async function dohLookup(name: string, type: RecordType): Promise<string[]> {
  const url = `${DOH}?name=${encodeURIComponent(name)}&type=${type}`;
  const res = await fetch(url, {
    headers: { accept: "application/dns-json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("DOH_FAILED");
  const data = (await res.json()) as { Answer?: Array<{ data: string }> };
  return Array.isArray(data.Answer) ? data.Answer.map((a) => String(a.data)) : [];
}

export type DomainCheck = {
  mxOk: boolean;
  txtOk: boolean;
  ok: boolean;
  mx: string[];
  txt: string[];
};

/**
 * A domain is ready when its MX records point at Cloudflare Email Routing and a
 * TXT record at `_tmail.<domain>` proves ownership.
 */
export async function checkDomain(domain: string, token: string): Promise<DomainCheck> {
  const expected = `tmail-verify=${token}`;
  const [mx, txt] = await Promise.all([
    dohLookup(domain, "MX").catch(() => [] as string[]),
    dohLookup(`_tmail.${domain}`, "TXT").catch(() => [] as string[]),
  ]);

  const mxHosts = mx.map((record) => record.split(/\s+/).pop() || "");
  const mxOk = mxHosts.some((host) => /mx\.cloudflare\.net\.?$/i.test(host));
  const txtOk = txt.some((record) => record.replace(/"/g, "").includes(expected));

  return { mxOk, txtOk, ok: mxOk && txtOk, mx, txt };
}

export const CLOUDFLARE_MX = [
  { host: "route1.mx.cloudflare.net", priority: 10 },
  { host: "route2.mx.cloudflare.net", priority: 20 },
  { host: "route3.mx.cloudflare.net", priority: 30 },
];
