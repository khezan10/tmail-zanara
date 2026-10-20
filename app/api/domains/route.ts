import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { checkDomain, CLOUDFLARE_MX } from "@/lib/dns";
import { rateLimit } from "@/lib/ratelimit";
import {
  isReservedDomain,
  isValidDomain,
  isValidEmail,
  normalizeDomain,
  randomToken,
} from "@/lib/validate";
import type { DomainDoc } from "@/lib/types";

/** GET /api/domains — public list of active domains. */
export async function GET() {
  try {
    const db = await getDb();
    const docs = await db
      .collection<DomainDoc>("domains")
      .find({ status: "active" }, { projection: { _id: 0, domain: 1, status: 1, verifiedAt: 1 } })
      .sort({ domain: 1 })
      .limit(200)
      .toArray();
    return NextResponse.json(
      { domains: docs.map((d) => ({ domain: d.domain, status: d.status, verifiedAt: d.verifiedAt })) },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ domains: [], error: "DB_UNAVAILABLE" }, { status: 503 });
  }
}

/** POST /api/domains — register a domain and return the DNS setup. */
export async function POST(req: NextRequest) {
  let body: { domain?: string; contact?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const domain = normalizeDomain(body.domain || "");
  const contact = (body.contact || "").trim().toLowerCase();

  if (!isValidDomain(domain)) {
    return NextResponse.json({ error: "INVALID_DOMAIN" }, { status: 400 });
  }
  if (isReservedDomain(domain)) {
    return NextResponse.json({ error: "DOMAIN_RESERVED" }, { status: 409 });
  }
  if (contact && !isValidEmail(contact)) {
    return NextResponse.json({ error: "INVALID_CONTACT" }, { status: 400 });
  }

  try {
    const limit = await rateLimit(req, "domain-create", 5);
    if (!limit.allowed) {
      return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });
    }

    const db = await getDb();
    const col = db.collection<DomainDoc>("domains");
    const total = await col.countDocuments();
    if (total >= 500) {
      return NextResponse.json({ error: "DOMAIN_LIMIT_REACHED" }, { status: 503 });
    }

    const existing = await col.findOne({ domain });
    const token = existing?.token || randomToken();
    const now = new Date();

    if (!existing) {
      await col.insertOne({
        domain,
        token,
        contact,
        status: "pending",
        createdAt: now,
      });
    }

    const check = await checkDomain(domain, token);
    if (check.ok) {
      await col.updateOne(
        { domain },
        { $set: { status: "active", verifiedAt: now, lastCheckedAt: now } }
      );
    } else {
      await col.updateOne({ domain }, { $set: { lastCheckedAt: now } });
    }

    return NextResponse.json(
      {
        domain,
        status: check.ok ? "active" : "pending",
        mxOk: check.mxOk,
        txtOk: check.txtOk,
        records: {
          txt: { name: `_tmail.${domain}`, value: `tmail-verify=${token}` },
          mx: CLOUDFLARE_MX,
        },
      },
      { status: existing ? 200 : 201 }
    );
  } catch {
    return NextResponse.json({ error: "DB_UNAVAILABLE" }, { status: 503 });
  }
}
