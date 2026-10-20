import { createHash } from "crypto";
import type { NextRequest } from "next/server";
import { getDb } from "@/lib/mongodb";
import type { RateDoc } from "@/lib/types";

export function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "0.0.0.0";
}

function hashIp(ip: string): string {
  return createHash("sha256")
    .update(`${process.env.IP_HASH_SALT || "tmail"}:${ip}`)
    .digest("hex")
    .slice(0, 32);
}

/** Simple fixed-window limiter stored in Mongo (one document per IP + bucket). */
export async function rateLimit(
  req: NextRequest,
  bucket: string,
  limit: number
): Promise<{ allowed: boolean; retryAfter: number }> {
  const window = 3600;
  const now = new Date();
  const key = `${bucket}:${hashIp(clientIp(req))}:${Math.floor(now.getTime() / (window * 1000))}`;
  const db = await getDb();
  const col = db.collection<RateDoc>("rate_limits");
  await col.createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 }).catch(() => null);
  const doc = await col.findOneAndUpdate(
    { _id: key },
    { $inc: { count: 1 }, $setOnInsert: { expireAt: new Date(now.getTime() + window * 1000) } },
    { upsert: true, returnDocument: "after" }
  );
  const count = doc?.count ?? 1;
  return { allowed: count <= limit, retryAfter: window };
}
