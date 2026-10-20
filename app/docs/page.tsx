export const metadata = {
  title: "Domain setup — Tmail Zanara",
  description: "How to point your own domain at Tmail Zanara and receive mail in seconds.",
};

const steps = [
  {
    title: "1. Put the domain on Cloudflare",
    body: "Add the domain to your Cloudflare account and let Cloudflare manage its nameservers. Email Routing only works for zones on Cloudflare.",
  },
  {
    title: "2. Enable Email Routing",
    body: "Open the zone → Email → Email Routing → Enable. Cloudflare adds the three MX records (route1/2/3.mx.cloudflare.net) automatically. If you already have MX records, replace them.",
  },
  {
    title: "3. Prove ownership with a TXT record",
    body: "Register the domain on the home page, then copy the TXT record it shows. Name: _tmail.<your-domain>, value: tmail-verify=<token>. We check it over DNS-over-HTTPS.",
  },
  {
    title: "4. Route mail to the worker",
    body: "Deploy worker/email-worker.js (wrangler deploy, see docs/CLOUDFLARE.md), then in Email Routing → Routes create a catch-all rule that sends every address to that worker. The worker posts each message to /api/inbound with your INBOUND_SECRET.",
  },
  {
    title: "5. Verify",
    body: "Press “verify now”. When MX and TXT both resolve, the domain turns active and appears in the mailbox dropdown. Send a test message and it should show up within a few seconds.",
  },
];

export default function Docs() {
  return (
    <main className="stage">
      <header>
        <p className="eyebrow">▓▒░ docs</p>
        <h1 className="title">
          DOMAIN<span className="dot">.</span>SETUP<span className="caret">_</span>
        </h1>
        <p className="sub">
          Tmail Zanara is open source: anyone can add a domain they control. There is no
          account system — the TXT record is the proof of ownership.
        </p>
      </header>

      <section className="card">
        <h2 className="card-title">steps</h2>
        <ol className="steps">
          {steps.map((step) => (
            <li key={step.title} style={{ marginBottom: 14 }}>
              <strong style={{ color: "var(--ink)" }}>{step.title}</strong>
              <br />
              {step.body}
            </li>
          ))}
        </ol>
      </section>

      <section className="card">
        <h2 className="card-title">records</h2>
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
              <td>_tmail.yourdomain.com</td>
              <td>tmail-verify=&lt;token from the home page&gt;</td>
            </tr>
            <tr>
              <td>MX</td>
              <td>yourdomain.com</td>
              <td>route1.mx.cloudflare.net (10)</td>
            </tr>
            <tr>
              <td>MX</td>
              <td>yourdomain.com</td>
              <td>route2.mx.cloudflare.net (20)</td>
            </tr>
            <tr>
              <td>MX</td>
              <td>yourdomain.com</td>
              <td>route3.mx.cloudflare.net (30)</td>
            </tr>
          </tbody>
        </table>
        <p className="meta" style={{ marginTop: 12 }}>
          Cloudflare adds the MX records for you when Email Routing is enabled — you only need the
          TXT record.
        </p>
      </section>

      <section className="card">
        <h2 className="card-title">privacy</h2>
        <p className="sub" style={{ marginTop: 0 }}>
          Inboxes are public: anyone who knows an address can read it. Do not use Tmail Zanara for
          banking, account recovery, or anything sensitive. All messages are deleted every night at
          01:00 WIB (18:00 UTC).
        </p>
      </section>

      <footer className="footer">
        <a href="/">&lt; back to mailbox</a>
        <span>open source · MIT</span>
      </footer>
    </main>
  );
}
