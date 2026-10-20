import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import type { MessageDoc } from "@/lib/types";

/** GET /api/cron/purge — runs daily at 01:00 Asia/Jakarta (18:00 UTC). */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const db = await getDb();
    const res = await db.collection<MessageDoc>("messages").deleteMany({});
    return NextResponse.json({ ok: true, purged: res.deletedCount });
  } catch {
    return NextResponse.json({ error: "DB_UNAVAILABLE" }, { status: 503 });
  }
}
