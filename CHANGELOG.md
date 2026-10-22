# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — 2026-10-22

The first stable release of the temporary inbox.

### Added

- **Any domain you own** — register a domain, prove ownership with one TXT
  record, and it becomes selectable for every visitor.
- **Inbound via Cloudflare Email Routing** — no SMTP server to maintain; a
  small Email Worker forwards each message to `/api/inbound`, and the MIME
  parsing happens on the server with `postal-mime`.
- **A live inbox** — polled every 6 seconds, with the message rendered inside
  a sandboxed iframe.
- **Meaningful random names** — every inbox is named from a Greek root
  (philosophy, science, myth, place), optionally joined with a Greek epithet,
  plus a 10-character code: `anthropos_aiue983hnf`, `hippokrates_barys_crbow2v88w`.
  The etymology is shown under the field.
- **A name catalogue in MongoDB** — 210 roots × 60 epithets = 12,810 base
  names, and it can grow without a redeploy through `POST /api/names`.
- **A nightly wipe** — Vercel Cron calls `/api/cron/purge` at 01:00 WIB and
  deletes every stored message.
- **A self-healing deploy** — a GitHub Action redeploys when the last Vercel
  build failed.
- **Tests** — unit tests for the DNS verification, the name catalogue, the
  identity and the address validation.
- **CI** — lint, typecheck, tests and a production build on Node 20 and 22.
- **A secret scan** that fails the build if a credential reaches a commit.
- **Dependabot** — weekly minor and patch updates.

### Changed

- The ESLint setup no longer uses `eslint-config-next`, for the same reason as
  in the other MZG projects: it pulls in `fast-glob → micromatch → braces`,
  and the current `braces` advisory made `npm audit` report five high severity
  issues. The plugins are used directly now, and `npm audit` reports
  **0 vulnerabilities**.
- The Cloudflare Worker is linted with its own globals, so `fetch` and the
  Fetch API classes are not reported as undefined.

### Fixed

- `@types/node` was moved to 22 so `npm install` and Vitest 5 agree.
- The worker sends the raw MIME and the server parses it, which keeps the
  worker small and dependency-free.
- The loader, the entrance and the typewriter animations no longer get stuck
  when the tab is in the background.

[1.0.0]: https://github.com/khezan10/tmail-zanara/releases/tag/v1.0.0
