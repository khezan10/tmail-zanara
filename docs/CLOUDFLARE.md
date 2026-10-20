# Cloudflare Email Routing setup

Tmail Zanara does not run its own SMTP server. Inbound mail arrives through
Cloudflare Email Routing, which hands every message to a Cloudflare Email Worker;
the worker posts a JSON summary to `/api/inbound` on Vercel.

```
sender ──▶ MX route1.mx.cloudflare.net ──▶ Cloudflare Email Routing
                                              │
                                              ▼ catch-all route
                                    Email Worker (tmail-zanara)
                                              │  POST /api/inbound
                                              ▼
                                    Vercel + MongoDB Atlas
```

## A. One-time setup for `mzg.my.id`

1. **Cloudflare dashboard** → zone `mzg.my.id` → **Email** → **Email Routing** → **Enable
   Email Routing**. Cloudflare creates the MX and SPF records.
2. **Workers & Pages** → **Create** → **Worker** → name it `tmail-zanara`.
3. Copy `worker/email-worker.js` and `worker/wrangler.toml` into a folder, then:

   ```bash
   npx wrangler deploy
   npx wrangler secret put TMAIL_INBOUND_SECRET   # = INBOUND_SECRET from Vercel
   ```

   The worker has no npm dependencies: it forwards the raw message and the
   server parses the MIME (so the worker stays tiny and deploys in one file).

   `TMAIL_INBOUND_URL` is already set in `wrangler.toml`
   (`https://tmail.mzg.my.id/api/inbound`).
4. **Email Routing** → **Routes** → **Catch-all address** → **Send to a Worker** →
   choose `tmail-zanara` → save. Every address on the zone now lands in Tmail.
5. Add the MX records if Cloudflare did not: `route1.mx.cloudflare.net` (10),
   `route2.mx.cloudflare.net` (20), `route3.mx.cloudflare.net` (30).

Optional but recommended: keep a real mailbox for `postmaster@mzg.my.id` and
`abuse@mzg.my.id` by adding custom addresses that forward elsewhere before the
catch-all rule.

## B. A visitor adds their own domain

The visitor needs a Cloudflare account for their domain (Email Routing is a
Cloudflare feature). The steps on the website mirror this:

1. Add the domain to Cloudflare, change nameservers, wait for **Active**.
2. Enable **Email Routing** for that zone (Cloudflare writes the MX records).
3. Register the domain at the Tmail homepage → copy the TXT record
   `_tmail.<their-domain>` = `tmail-verify=<token>` into their DNS.
4. Give them the worker to deploy in **their** account:
   `wrangler deploy` with `TMAIL_INBOUND_URL` pointing at this deployment and
   `TMAIL_INBOUND_SECRET` set to the shared secret (the operator hands it out).
5. In their zone: **Email Routing → Routes → Catch-all → Send to a Worker →
   tmail-zanara**.
6. Press **verify now** on the site. When MX and TXT resolve, the domain turns
   `active` and appears in the mailbox dropdown.

### Why a worker per domain?

Cloudflare routes mail inside the zone that owns the MX records, so each domain
needs its own Email Routing → Worker binding. One worker codebase can serve many
domains; each account deploys its own copy.

## C. Testing without a domain

```bash
curl -X POST https://tmail.mzg.my.id/api/inbound \
  -H "authorization: Bearer $INBOUND_SECRET" \
  -H "content-type: application/json" \
  -d '{"from":"test@example.com","to":"demo@mzg.my.id","subject":"hello","text":"it works"}'
```

Then open `demo@mzg.my.id` in the UI.
