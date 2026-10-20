const DOMAIN_RE = /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))+$/;
const LOCAL_RE = /^[a-z0-9](?:[a-z0-9._-]{0,62}[a-z0-9])?$/i;

/** Domains owned by this deployment; users may not claim them. */
const RESERVED = new Set([
  "mzg.my.id",
  "www.mzg.my.id",
  "tmail.mzg.my.id",
  "link.mzg.my.id",
  "zanara-project.vercel.app",
]);

export function normalizeDomain(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^[a-z]+:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/^www\./, "")
    .replace(/\.$/, "");
}

export function isValidDomain(domain: string): boolean {
  return domain.length > 3 && domain.length <= 253 && DOMAIN_RE.test(domain);
}

export function isReservedDomain(domain: string): boolean {
  return RESERVED.has(domain);
}

export function normalizeAddress(input: string): string {
  return input.trim().toLowerCase();
}

export function splitAddress(address: string): { local: string; domain: string } | null {
  const at = address.lastIndexOf("@");
  if (at < 1 || at === address.length - 1) return null;
  return { local: address.slice(0, at), domain: address.slice(at + 1) };
}

export function isValidLocalPart(local: string): boolean {
  return local.length > 0 && local.length <= 64 && LOCAL_RE.test(local);
}

export function isValidEmail(input: string): boolean {
  const parts = splitAddress(normalizeAddress(input));
  if (!parts) return false;
  return isValidLocalPart(parts.local) && isValidDomain(parts.domain);
}

const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

export function randomLocalPart(length = 10): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

export function randomToken(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
