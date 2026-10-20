import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

function classify(message: string): string {
  if (/authentication failed/i.test(message)) return "AUTH_FAILED";
  if (/not allowed to access|whitelist|allowlist/i.test(message)) return "IP_NOT_WHITELISTED";
  if (/timed out|econnrefused|server selection/i.test(message)) return "CONNECT_TIMEOUT";
  if (/getaddrinfo|enotfound|eai_again|querysrv/i.test(message)) return "DNS_FAILED";
  return "UNKNOWN";
}

export async function GET(req: NextRequest) {
  try {
    const db = await getDb();
    const [domains, messages] = await Promise.all([
      db.collection("domains").countDocuments({ status: "active" }),
      db.collection("messages").countDocuments(),
    ]);
    return NextResponse.json({ ok: true, activeDomains: domains, messages });
  } catch (e) {
    const message = (e as Error).message || "";
    const debug =
      !!process.env.CRON_SECRET &&
      req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`;
    return NextResponse.json(
      {
        ok: false,
        reason: classify(message),
        ...(debug ? { detail: message.slice(0, 300) } : {}),
      },
      { status: 500 }
    );
  }
}
