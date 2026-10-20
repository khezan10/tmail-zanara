import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { checkDomain } from "@/lib/dns";
import { normalizeDomain } from "@/lib/validate";
import type { DomainDoc } from "@/lib/types";

/** POST /api/domains/[domain]/verify — re-check DNS and promote to active. */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ domain: string }> }
) {
  const { domain: raw } = await params;
  const domain = normalizeDomain(decodeURIComponent(raw));

  try {
    const db = await getDb();
    const col = db.collection<DomainDoc>("domains");
    const doc = await col.findOne({ domain });
    if (!doc) {
      return NextResponse.json({ error: "DOMAIN_NOT_FOUND" }, { status: 404 });
    }

    const check = await checkDomain(domain, doc.token);
    const now = new Date();

    if (check.ok) {
      await col.updateOne(
        { domain },
        { $set: { status: "active", verifiedAt: now, lastCheckedAt: now } }
      );
    } else {
      await col.updateOne({ domain }, { $set: { lastCheckedAt: now } });
    }

    return NextResponse.json({
      domain,
      status: check.ok ? "active" : "pending",
      mxOk: check.mxOk,
      txtOk: check.txtOk,
    });
  } catch {
    return NextResponse.json({ error: "DB_UNAVAILABLE" }, { status: 503 });
  }
}
