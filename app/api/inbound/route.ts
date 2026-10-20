import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { normalizeAddress, splitAddress } from "@/lib/validate";
import type { DomainDoc, MessageDoc } from "@/lib/types";

const MAX_BODY = 200_000;

type Inbound = {
  from?: string;
  to?: string;
  subject?: string;
  text?: string;
  html?: string;
};

/**
 * POST /api/inbound — called by the Cloudflare Email Worker.
 * Auth: Authorization: Bearer $INBOUND_SECRET
 */
export async function POST(req: NextRequest) {
  const secret = process.env.INBOUND_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "INBOUND_NOT_CONFIGURED" }, { status: 503 });
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  let body: Inbound;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const address = normalizeAddress(body.to || "");
  const parts = splitAddress(address);
  if (!parts) {
    return NextResponse.json({ error: "INVALID_RECIPIENT" }, { status: 400 });
  }

  try {
    const db = await getDb();

    // Hanya domain yang terdaftar (aktif atau menunggu verifikasi) yang diterima.
    const domainDoc = await db
      .collection<DomainDoc>("domains")
      .findOne({ domain: parts.domain }, { projection: { status: 1 } });
    if (!domainDoc) {
      return NextResponse.json({ error: "DOMAIN_NOT_REGISTERED" }, { status: 404 });
    }

    const doc: MessageDoc = {
      address,
      domain: parts.domain,
      from: normalizeAddress(body.from || "unknown"),
      to: address,
      subject: (body.subject || "(no subject)").slice(0, 400),
      text: (body.text || "").slice(0, MAX_BODY),
      html: (body.html || "").slice(0, MAX_BODY),
      receivedAt: new Date(),
    };

    const result = await db.collection<MessageDoc>("messages").insertOne(doc);
    return NextResponse.json({ ok: true, id: result.insertedId.toString() }, { status: 202 });
  } catch {
    return NextResponse.json({ error: "DB_UNAVAILABLE" }, { status: 503 });
  }
}
