# Tmail Zanara

Temporary, disposable email inboxes served on domains **you** own. Open source, no
accounts, no passwords — and every message is wiped at **01:00 WIB (18:00 UTC)**.

Live: <https://tmail.mzg.my.id> · docs: <https://tmail.mzg.my.id/docs>

> Use it for signups, OTPs, and one-off verifications. Never for banking or account
> recovery — inboxes are public to anyone who knows the address.

## Features

- **Any domain** — register a domain, prove ownership with one TXT record, and it
  becomes selectable for every visitor.
- **Inbound via Cloudflare Email Routing** — no SMTP server to maintain; a small
  Email Worker forwards each message to `/api/inbound`.
- **Live inbox** — polling every 6 seconds, HTML rendered inside a sandboxed iframe.
- **Meaningful random names** — every new inbox is named from a Greek root (philosophy, science,
  myth, place), optionally joined with a Greek epithet, plus a 10-character code, e.g.
  `anthropos_aiue983hnf` or `hippokrates_barys_crbow2v88w`. The etymology is shown under the field.
  The catalogue lives in MongoDB (`names`) with 210 roots × 60 epithets = 12,810 base names,
  and can grow without a redeploy:

  ```bash
  curl -X POST https://tmail.mzg.my.id/api/names \
    -H "authorization: Bearer $CRON_SECRET" -H "content-type: application/json" \
    -d '{"word":"koinonia","meaning":"community, fellowship","origin":"greek"}'
  ```
- **Nightly wipe** — Vercel Cron calls `/api/cron/purge` at 01:00 WIB and deletes
  every stored message.
- **Open** — no login. Inboxes are addressed by `name@domain`; anyone with the
  address can read it, which is the point of a throwaway inbox.
- **Self-healing deploys** — a GitHub Action redeploys automatically when the last
  Vercel build failed (see `.github/workflows/self-heal.yml`).

## Stack

| Layer | Choice |
|---|---|
| App | Next.js 16 (App Router, TypeScript, Tailwind v4) |
| Data | MongoDB Atlas (`domains`, `messages`, `rate_limits`) |
| Inbound | Cloudflare Email Routing → Email Worker → `POST /api/inbound` |
| Hosting | Vercel + Vercel Cron |
| Tests | Vitest |

## Quick start (self-host)

```bash
git clone https://github.com/khezan10/tmail-zanara.git
cd tmail-zanara
npm install
cp .env.example .env.local   # fill MONGODB_URI, INBOUND_SECRET, CRON_SECRET, IP_HASH_SALT
npm run dev
```

Deploy with Vercel, then set the same variables under **Settings → Environment
Variables**. Collection indexes are created on the first request.

## Environment

| Name | Required | Notes |
|---|---|---|
| `MONGODB_URI` | yes | Atlas URI, password URL-encoded |
| `MONGODB_DB` | no | defaults to `tmail` |
| `INBOUND_SECRET` | yes | Bearer token the Email Worker sends |
| `CRON_SECRET` | yes | Bearer token for `/api/cron/purge` |
| `IP_HASH_SALT` | yes | Salt for hashed rate-limit keys |
| `NEXT_PUBLIC_SITE_URL` | no | Public URL used in docs and links |

## API

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/domains` | Active domains |
| `POST` | `/api/domains` | Register a domain → returns TXT/MX records |
| `POST` | `/api/domains/{domain}/verify` | Re-check DNS and activate |
| `POST` | `/api/inbound` | Worker only (Bearer `INBOUND_SECRET`) |
| `GET` | `/api/messages?address=` | Inbox list for an address |
| `DELETE` | `/api/messages?address=` | Wipe one inbox |
| `GET`/`DELETE` | `/api/messages/{id}` | Full message / delete one |
| `GET` | `/api/cron/purge` | Cron only (Bearer `CRON_SECRET`) |
| `GET` | `/api/health` | `{ ok, activeDomains, messages }` |

```bash
curl -X POST https://tmail.mzg.my.id/api/inbound \
  -H "authorization: Bearer $INBOUND_SECRET" \
  -H "content-type: application/json" \
  -d '{"from":"a@example.com","to":"demo@mzg.my.id","subject":"hi","text":"hello"}'
```

## Adding a domain

1. Put the domain on Cloudflare and enable **Email Routing** (Cloudflare writes the
   MX records).
2. On the homepage enter the domain and copy the `_tmail.<domain>` TXT record it
   shows into DNS.
3. Deploy the worker from `worker/` in your Cloudflare account with
   `TMAIL_INBOUND_SECRET` set, then point **Email Routing → Catch-all → Worker** at
   it.
4. Press **verify now**. When MX and TXT resolve, the domain becomes `active`.

Full walkthrough: [`docs/CLOUDFLARE.md`](docs/CLOUDFLARE.md).

## Retention

- Messages are deleted every night at 01:00 WIB by the cron job.
- No accounts, no cookies, no analytics. Rate limits only store a salted hash of the
  client IP.

## Maintenance

- `dependabot.yml` keeps npm and GitHub Actions current (weekly, grouped).
- `dependabot-auto-merge.yml` enables auto-merge, so a green PR merges itself.
- `self-heal.yml` redeploys production when the latest Vercel build failed or the
  health endpoint is down.

## License

MIT
