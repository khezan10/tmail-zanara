# Security

Tmail Zanara is a disposable-mail service: inboxes are public by design. Please
keep that in mind before reporting an issue.

## Reporting

Email **contact@mzg.my.id** with the details and a reproduction. Do not open a
public issue for anything that could be abused.

## In scope

- Reading another user's inbox without knowing the address (e.g. enumeration).
- Bypassing the `INBOUND_SECRET` on `/api/inbound`.
- SSRF, injection, or remote code execution in the Next.js routes.
- Stored XSS through message bodies (HTML is rendered inside a sandboxed iframe —
  escaping sandbox=`""` would be a bug).
- Rate-limit bypass that allows mass domain registration.

## Out of scope

- Anyone reading an inbox whose address they already know.
- Spam or phishing delivered to a temporary address.
- Denial of service through bulk signups on free-tier infrastructure.

## Handling of data

- Messages are deleted every night at 01:00 WIB by a Vercel Cron job.
- Rate limiting stores only a salted SHA-256 of the client IP.
- No accounts, no cookies, no analytics.
