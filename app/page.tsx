"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Domain = { domain: string; status: string; verifiedAt?: string };
type Message = {
  id: string;
  from: string;
  subject: string;
  preview: string;
  receivedAt: string;
};
type MessageFull = Message & { to: string; text: string; html: string };

type RegisterResult = {
  domain: string;
  status: "pending" | "active";
  mxOk: boolean;
  txtOk: boolean;
  records: {
    txt: { name: string; value: string };
    mx: Array<{ host: string; priority: number }>;
  };
};

const ERROR_TEXT: Record<string, string> = {
  INVALID_DOMAIN: "That does not look like a domain.",
  DOMAIN_RESERVED: "That domain belongs to this deployment.",
  INVALID_CONTACT: "Contact email looks invalid.",
  RATE_LIMITED: "Too many requests, try again later.",
  DOMAIN_LIMIT_REACHED: "This server reached its domain limit.",
  DB_UNAVAILABLE: "Database not ready, try again shortly.",
  INVALID_ADDRESS: "Address looks invalid.",
};

const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

function randomLocal(length = 10): string {
  let out = "";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < length; i += 1) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "now";
  if (min < 60) return `${min}m`;
  const hours = Math.round(min / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}

export default function Home() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [local, setLocal] = useState("");
  const [domain, setDomain] = useState("");
  const [address, setAddress] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [open, setOpen] = useState<MessageFull | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [regDomain, setRegDomain] = useState("");
  const [regContact, setRegContact] = useState("");
  const [regBusy, setRegBusy] = useState(false);
  const [regResult, setRegResult] = useState<RegisterResult | null>(null);
  const [regError, setRegError] = useState("");
  const poll = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeDomains = useMemo(
    () => domains.filter((d) => d.status === "active").map((d) => d.domain),
    [domains]
  );

  const loadDomains = useCallback(async () => {
    try {
      const res = await fetch("/api/domains");
      const data = await res.json();
      setDomains(data.domains || []);
      setDomain((current) => current || data.domains?.[0]?.domain || "");
    } catch {
      setError("Could not load domains.");
    }
  }, []);

  useEffect(() => {
    loadDomains();
    setLocal(randomLocal());
  }, [loadDomains]);

  const loadMessages = useCallback(async (addr: string) => {
    try {
      const res = await fetch(`/api/messages?address=${encodeURIComponent(addr)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(ERROR_TEXT[data.error] || "Could not load inbox.");
        return;
      }
      setMessages(data.messages || []);
    } catch {
      setError("Could not load inbox.");
    }
  }, []);

  useEffect(() => {
    if (!address) return;
    loadMessages(address);
    poll.current = setInterval(() => loadMessages(address), 6000);
    return () => {
      if (poll.current) clearInterval(poll.current);
    };
  }, [address, loadMessages]);

  function openInbox() {
    const raw = local.trim().toLowerCase();
    if (!raw) {
      setError("Enter a name first.");
      return;
    }
    if (raw.includes("@")) {
      setAddress(raw);
      setLocal(raw.split("@")[0]);
    } else {
      if (!domain) {
        setError("No verified domain yet — register one below.");
        return;
      }
      setAddress(`${raw}@${domain}`);
    }
    setError("");
    setOpen(null);
  }

  async function copyAddress() {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  async function showMessage(id: string) {
    try {
      const res = await fetch(`/api/messages/${id}`);
      const data = await res.json();
      if (!res.ok) {
        setError(ERROR_TEXT[data.error] || "Could not open message.");
        return;
      }
      setOpen(data);
    } catch {
      setError("Could not open message.");
    }
  }

  async function deleteMessage(id: string) {
    await fetch(`/api/messages/${id}`, { method: "DELETE" });
    if (open?.id === id) setOpen(null);
    if (address) loadMessages(address);
  }

  async function clearInbox() {
    if (!address) return;
    setBusy(true);
    await fetch(`/api/messages?address=${encodeURIComponent(address)}`, { method: "DELETE" });
    setMessages([]);
    setOpen(null);
    setBusy(false);
  }

  async function registerDomain(e: React.FormEvent) {
    e.preventDefault();
    setRegBusy(true);
    setRegError("");
    setRegResult(null);
    try {
      const res = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: regDomain, contact: regContact }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRegError(ERROR_TEXT[data.error] || "Could not register domain.");
      } else {
        setRegResult(data);
        loadDomains();
      }
    } catch {
      setRegError("Could not register domain.");
    } finally {
      setRegBusy(false);
    }
  }

  async function verifyDomain() {
    if (!regResult) return;
    setRegBusy(true);
    try {
      const res = await fetch(`/api/domains/${encodeURIComponent(regResult.domain)}/verify`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setRegError(ERROR_TEXT[data.error] || "Verification failed.");
      } else {
        setRegResult({ ...regResult, status: data.status, mxOk: data.mxOk, txtOk: data.txtOk });
        loadDomains();
      }
    } finally {
      setRegBusy(false);
    }
  }

  return (
    <main className="stage">
      <header>
        <p className="eyebrow">▓▒░ temporary mail by zanara</p>
        <h1 className="title">
          TMAIL<span className="dot">.</span>ZANARA<span className="caret">_</span>
        </h1>
        <p className="sub">
          Disposable inboxes on domains you own. No signup, no password, open source. Every
          message is wiped at 01:00 WIB (18:00 UTC).
        </p>
      </header>

      <section className="card" aria-label="Mailbox">
        <h2 className="card-title">mailbox</h2>
        <div className="row">
          <input
            className="field"
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            placeholder="your-name"
            aria-label="Address name"
            autoComplete="off"
          />
          <span className="meta">@</span>
          <select
            className="field"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            aria-label="Domain"
          >
            {activeDomains.length === 0 && <option value="">no verified domain yet</option>}
            {activeDomains.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <button className="btn" type="button" onClick={openInbox}>
            &gt; open inbox
          </button>
          <button
            className="btn ghost small"
            type="button"
            onClick={() => setLocal(randomLocal())}
            title="Random name"
          >
            random
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        {address && (
          <>
            <div className="address-bar">
              <span className="address">{address}</span>
              <span className="row">
                <button className="btn ghost small" type="button" onClick={copyAddress}>
                  {copied ? "copied ✓" : "copy"}
                </button>
                <button
                  className="btn ghost small"
                  type="button"
                  onClick={() => loadMessages(address)}
                >
                  refresh
                </button>
                <button
                  className="btn ghost small"
                  type="button"
                  onClick={clearInbox}
                  disabled={busy || messages.length === 0}
                >
                  clear
                </button>
              </span>
            </div>

            {messages.length > 0 ? (
              <ul className="list">
                {messages.map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      className={`item ${open?.id === m.id ? "active" : ""}`}
                      onClick={() => showMessage(m.id)}
                    >
                      <span className="item-subject">{m.subject}</span>
                      <span className="item-time">{timeAgo(m.receivedAt)}</span>
                      <span className="item-preview">
                        {m.from} — {m.preview || "(no text body)"}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty">inbox is empty — waiting for mail_</p>
            )}

            {open && (
              <div className="viewer">
                <div className="viewer-head">
                  <div>
                    <p className="item-subject">{open.subject}</p>
                    <p className="meta">
                      {open.from} → {open.to}
                    </p>
                  </div>
                  <button
                    className="btn ghost small"
                    type="button"
                    onClick={() => deleteMessage(open.id)}
                  >
                    delete
                  </button>
                </div>
                {open.html ? (
                  <iframe
                    className="viewer-html"
                    sandbox=""
                    srcDoc={open.html}
                    title="Message content"
                  />
                ) : (
                  <pre className="viewer-body">{open.text || "(no text body)"}</pre>
                )}
              </div>
            )}
          </>
        )}
      </section>

      <section className="card" aria-label="Domains">
        <h2 className="card-title">domains</h2>
        {activeDomains.length > 0 ? (
          <ul className="chips">
            {activeDomains.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        ) : (
          <p className="meta">No domain verified yet. Add yours below.</p>
        )}

        <form className="row" onSubmit={registerDomain} style={{ marginTop: 16 }}>
          <input
            className="field"
            value={regDomain}
            onChange={(e) => setRegDomain(e.target.value)}
            placeholder="yourdomain.com"
            aria-label="Your domain"
            required
          />
          <input
            className="field"
            value={regContact}
            onChange={(e) => setRegContact(e.target.value)}
            placeholder="you@example.com (optional)"
            aria-label="Contact email"
            type="email"
          />
          <button className="btn" type="submit" disabled={regBusy}>
            {regBusy ? "checking…" : "> add domain"}
          </button>
        </form>

        {regError && <p className="error">{regError}</p>}

        {regResult && (
          <div className="dns">
            <p>
              <span className={`status ${regResult.status}`}>{regResult.status}</span>{" "}
              <span className="meta">
                mx {regResult.mxOk ? "ok" : "missing"} · txt {regResult.txtOk ? "ok" : "missing"}
              </span>
            </p>
            <ol className="steps">
              <li>Add the domain to Cloudflare and enable Email Routing (DNS → Email → Email Routing).</li>
              <li>
                Create a TXT record so we know the domain is yours:
                <table className="dns-table">
                  <thead>
                    <tr>
                      <th>type</th>
                      <th>name</th>
                      <th>value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>TXT</td>
                      <td>{regResult.records.txt.name}</td>
                      <td>{regResult.records.txt.value}</td>
                    </tr>
                    {regResult.records.mx.map((mx) => (
                      <tr key={mx.host}>
                        <td>MX</td>
                        <td>{regResult.domain}</td>
                        <td>
                          {mx.host} (priority {mx.priority})
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </li>
              <li>
                In Cloudflare Email Routing, route your domain to the <code>tmail-zanara</code>{" "}
                Email Worker with a catch-all rule. Details: <a href="/docs">/docs</a>.
              </li>
            </ol>
            <div className="row" style={{ marginTop: 12 }}>
              <button className="btn small" type="button" onClick={verifyDomain} disabled={regBusy}>
                verify now
              </button>
              <span className="meta">DNS changes can take a few minutes.</span>
            </div>
          </div>
        )}
      </section>

      <footer className="footer">
        <span>
          open source · <a href="https://github.com/khezan10/tmail-zanara">github</a> ·{" "}
          <a href="/docs">domain setup</a>
        </span>
        <span>messages deleted daily 01:00 WIB</span>
      </footer>
    </main>
  );
}
