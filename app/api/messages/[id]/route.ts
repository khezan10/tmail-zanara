import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import type { MessageDoc } from "@/lib/types";

/** GET /api/messages/[id] — full message body. */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "INVALID_ID" }, { status: 400 });
  }
  try {
    const db = await getDb();
    const doc = await db
      .collection<MessageDoc>("messages")
      .findOne({ _id: new ObjectId(id) });
    if (!doc) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    return NextResponse.json(
      {
        id: doc._id!.toString(),
        address: doc.address,
        from: doc.from,
        to: doc.to,
        subject: doc.subject,
        text: doc.text,
        html: doc.html,
        receivedAt: doc.receivedAt,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ error: "DB_UNAVAILABLE" }, { status: 503 });
  }
}

/** DELETE /api/messages/[id] — delete a single message. */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "INVALID_ID" }, { status: 400 });
  }
  try {
    const db = await getDb();
    const res = await db
      .collection<MessageDoc>("messages")
      .deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ ok: true, deleted: res.deletedCount });
  } catch {
    return NextResponse.json({ error: "DB_UNAVAILABLE" }, { status: 503 });
  }
}
