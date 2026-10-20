"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { randomIdentity, type Identity } from "@/lib/names";

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

const TITLE = "TMAIL.ZANARA";

const SUB_LINES = [
  "Disposable inboxes on domains you own. No signup, no password, open source.",
  "Every message is wiped at 01:00 WIB, so inboxes never pile up.",
  "Add your domain with one TXT record and start receiving mail in minutes.",
];

const BOOT_WORDS = ["booting tmail", "loading fonts", "syncing inbox", "ready"];

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
  const [seed, setSeed] = useState<Identity | null>(null);

  const [entered, setEntered] = useState(false);
  const bootRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const revealRefs = useRef<Array<HTMLElement | null>>([]);

  const activeDomains = useMemo(
    () => domains.filter((d) => d.status === "active").map((d) => d.domain),
    [domains]
  );

  // Nama yang terlihat: ketikan user, atau nama acak dari seed.
  const shownLocal = local || seed?.local || "";

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
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- nama acak sekali setelah fetch domain
    void loadDomains().then(() => {
      if (cancelled) return;
      setSeed((current) => current ?? randomIdentity());
    });
    return () => {
      cancelled = true;
    };
  }, [loadDomains]);

  function newIdentity() {
    setLocal("");
    setSeed(randomIdentity());
    setError("");
  }

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
    let cancelled = false;
    const run = () => {
      if (!cancelled) void loadMessages(address);
    };
    const kick = setTimeout(run, 0);
    poll.current = setInterval(run, 6000);
    return () => {
      cancelled = true;
      clearTimeout(kick);
      if (poll.current) clearInterval(poll.current);
    };
  }, [address, loadMessages]);

  // Loader ala shortlink: progres nyata (font + waktu minimum), lalu fade keluar.
  useEffect(() => {
    const loader = bootRef.current;
    const pctEl = pctRef.current;
    const wordEl = wordRef.current;
    const barEl = barRef.current;
    if (!loader || !pctEl || !wordEl || !barEl) {
      setEntered(true);
      return;
    }

    let wi = 0;
    const wordTimer = setInterval(() => {
      wi = Math.min(wi + 1, BOOT_WORDS.length - 1);
      wordEl.textContent = BOOT_WORDS[wi];
    }, 620);

    let fontReady = false;
    let minTime = false;
    let displayed = 0;
    let done = false;
    let raf = 0;
    const timers: { hardStop?: ReturnType<typeof setTimeout> } = {};

    const minTimer = setTimeout(() => {
      minTime = true;
    }, 1000);

    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready
        .then(() => {
          fontReady = true;
        })
        .catch(() => {
          fontReady = true;
        });
    } else {
      fontReady = true;
    }

    const target = () => ((fontReady ? 1 : 0) + (minTime ? 1 : 0)) / 2;

    const finish = () => {
      if (done) return;
      done = true;
      clearInterval(wordTimer);
      clearTimeout(minTimer);
      if (timers.hardStop) clearTimeout(timers.hardStop);
      pctEl.textContent = "100%";
      barEl.style.width = "100%";
      loader.style.transition = "opacity .5s ease";
      loader.style.opacity = "0";
      setTimeout(() => setEntered(true), 480);
    };

    // Jaring pengaman: rAF melambat saat tab tidak aktif.
    timers.hardStop = setTimeout(() => {
      fontReady = true;
      minTime = true;
      finish();
    }, 2400);

    const tick = () => {
      displayed += (target() - displayed) * 0.14;
      if (target() >= 1) displayed = Math.min(1, displayed + 0.05);
      pctEl.textContent = `${Math.round(displayed * 100)}%`;
      barEl.style.width = `${Math.round(displayed * 100)}%`;
      if (target() < 1 || displayed < 0.995) {
        raf = requestAnimationFrame(tick);
        return;
      }
      finish();
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(wordTimer);
      clearTimeout(minTimer);
      if (timers.hardStop) clearTimeout(timers.hardStop);
    };
  }, []);

  // Entrance: huruf naik + unblur bertahap, lalu kartu menyusul.
  useEffect(() => {
    if (!entered) return;
    const title = titleRef.current;
    if (title) {
      const chars = Array.from(title.querySelectorAll<HTMLElement>(".ch"));
      chars.forEach((el) => {
        el.style.opacity = "0";
        el.style.filter = "blur(8px)";
        el.style.transform = "translateY(22px)";
        el.style.transition = "none";
      });
      requestAnimationFrame(() => {
        chars.forEach((el, i) => {
          el.style.transition =
            "opacity .7s ease, filter .7s ease, transform .7s cubic-bezier(.23,1,.32,1)";
          el.style.transitionDelay = `${0.05 + i * 0.045}s`;
          el.style.opacity = "1";
          el.style.filter = "blur(0)";
          el.style.transform = "translateY(0)";
        });
      });
      chars.forEach((el) => {
        el.style.textShadow = "0 0 10px rgba(180,255,43,0.22)";
        el.addEventListener("pointerenter", () => {
          el.animate(
            [
              { transform: "translateY(0px)" },
              { transform: "translateY(-18px)" },
              { transform: "translateY(0px)" },
            ],
            { duration: 520, easing: "cubic-bezier(.23,1,.32,1)" }
          );
        });
      });
    }
    revealRefs.current.forEach((el, i) => {
      if (!el) return;
      el.style.transitionDelay = `${0.12 + i * 0.12}s`;
      el.classList.add("in");
    });
  }, [entered]);

  // Sub berganti kalimat: ketik → tahan → hapus, kursor ▌ berkedip.
  useEffect(() => {
    if (!entered) return;
    const sub = subRef.current;
    const node = sub?.firstChild;
    if (!sub || !node || node.nodeType !== Node.TEXT_NODE) return;
    const text = node as Text;
    let li = 0;
    let ci = SUB_LINES[0].length;
    let phase: "hold" | "erase" | "type" = "hold";
    let holdUntil = performance.now() + 3400;
    const id = setInterval(() => {
      if (document.hidden) return;
      const now = performance.now();
      if (phase === "hold") {
        if (now < holdUntil) return;
        phase = "erase";
        return;
      }
      if (phase === "erase") {
        ci -= 2;
        if (ci <= 0) {
          ci = 0;
          li = (li + 1) % SUB_LINES.length;
          phase = "type";
        }
        text.textContent = SUB_LINES[li].slice(0, ci);
        return;
      }
      ci += 1;
      if (ci >= SUB_LINES[li].length) {
        ci = SUB_LINES[li].length;
        phase = "hold";
        holdUntil = now + 3400;
      }
      text.textContent = SUB_LINES[li].slice(0, ci);
    }, 45);
    return () => clearInterval(id);
  }, [entered]);

  function openInbox() {
    const raw = shownLocal.trim().toLowerCase();
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
    <>
      {!entered && (
        <div id="boot" ref={bootRef} aria-hidden="true">
          <div className="boot-inner">
            <div className="boot-line">
              <span ref={wordRef}>booting tmail</span>
              <span ref={pctRef}>0%</span>
            </div>
            <div className="boot-bar">
              <i ref={barRef} />
            </div>
          </div>
        </div>
      )}

      <main className="stage">
        <header>
          <p className="eyebrow">▓▒░ temporary mail by zanara</p>
          <div className="brand">
            {/* eslint-disable-next-line @next/next/no-img-element -- logo statis di public */}
            <img className="logo" src="/logo.svg" alt="Tmail Zanara" width={42} height={42} />
            <h1 className="title" ref={titleRef} aria-label="TMAIL.ZANARA">
              {Array.from(TITLE).map((ch, i) => (
                <span key={i} className={ch === "." ? "ch dot" : "ch"} aria-hidden="true">
                  {ch}
                </span>
              ))}
              <span className="ch caret" aria-hidden="true">_</span>
            </h1>
          </div>
          <p className="sub" ref={subRef}>
            {SUB_LINES[0]}
            <span className="type-caret" aria-hidden="true">▌</span>
          </p>
        </header>

      <section
        className="card reveal"
        aria-label="Mailbox"
        ref={(el) => {
          revealRefs.current[0] = el;
        }}
      >
        <h2 className="card-title">mailbox</h2>
        <div className="row">
          <input
            className="field"
            value={shownLocal}
            onChange={(e) => {
              setLocal(e.target.value);
              setSeed(null);
            }}
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
            onClick={newIdentity}
            title="Random name"
          >
            random
          </button>
        </div>

        {seed && (
          <p className="name-note">
            <span>{seed.word}</span>
            {seed.epithet ? (
              <>
                {" · "}
                <span>{seed.epithet.word}</span>
              </>
            ) : null}
            {" — "}
            {seed.origin}: {seed.meaning}
            {seed.epithet ? ` / ${seed.epithet.meaning}` : ""}
          </p>
        )}

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

      <section
        className="card reveal"
        aria-label="Domains"
        ref={(el) => {
          revealRefs.current[1] = el;
        }}
      >
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

      <footer
        className="footer reveal"
        ref={(el) => {
          revealRefs.current[2] = el;
        }}
      >
        <span>
          open source · <a href="https://github.com/khezan10/tmail-zanara">github</a> ·{" "}
          <a href="/docs">domain setup</a>
        </span>
        <span>messages deleted daily 01:00 WIB</span>
      </footer>
      </main>
    </>
  );
}
