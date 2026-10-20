import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

function classify(message: string): string {
  if (/authentication failed/i.test(message)) return "AUTH_FAILED";
  if (/timed out|econnrefused|server selection/i.test(message)) return "CONNECT_TIMEOUT";
  if (/getaddrinfo|enotfound/i.test(message)) return "DNS_FAILED";
  return "UNKNOWN";
}

export async function GET() {
  try {
    const db = await getDb();
    const [domains, messages] = await Promise.all([
      db.collection("domains").countDocuments({ status: "active" }),
      db.collection("messages").countDocuments(),
    ]);
    return NextResponse.json({ ok: true, activeDomains: domains, messages });
  } catch (e) {
    return NextResponse.json(
      { ok: false, reason: classify((e as Error).message || "") },
      { status: 500 }
    );
  }
}
