import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { rateLimit } from "@/lib/ratelimit";
import { normalizeAddress, splitAddress } from "@/lib/validate";
import type { MessageDoc } from "@/lib/types";

/** GET /api/messages?address=name@domain — public inbox for a temporary address. */
export async function GET(req: NextRequest) {
  const address = normalizeAddress(req.nextUrl.searchParams.get("address") || "");
  if (!splitAddress(address)) {
    return NextResponse.json({ error: "INVALID_ADDRESS" }, { status: 400 });
  }
  const limit = Math.min(
    Math.max(parseInt(req.nextUrl.searchParams.get("limit") || "50", 10) || 50, 1),
    100
  );

  try {
    const db = await getDb();
    const docs = await db
      .collection<MessageDoc>("messages")
      .find({ address }, { projection: { html: 0 } })
      .sort({ receivedAt: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json(
      {
        address,
        messages: docs.map((d) => ({
          id: d._id!.toString(),
          from: d.from,
          to: d.to,
          subject: d.subject,
          preview: (d.text || "").replace(/\s+/g, " ").slice(0, 160),
          receivedAt: d.receivedAt,
        })),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ messages: [], error: "DB_UNAVAILABLE" }, { status: 503 });
  }
}

/** DELETE /api/messages?address=name@domain — wipe one inbox. */
export async function DELETE(req: NextRequest) {
  const address = normalizeAddress(req.nextUrl.searchParams.get("address") || "");
  if (!splitAddress(address)) {
    return NextResponse.json({ error: "INVALID_ADDRESS" }, { status: 400 });
  }

  try {
    const limit = await rateLimit(req, "inbox-delete", 30);
    if (!limit.allowed) {
      return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });
    }
    const db = await getDb();
    const res = await db.collection<MessageDoc>("messages").deleteMany({ address });
    return NextResponse.json({ ok: true, deleted: res.deletedCount });
  } catch {
    return NextResponse.json({ error: "DB_UNAVAILABLE" }, { status: 503 });
  }
}
