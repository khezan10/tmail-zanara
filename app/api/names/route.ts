import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { invalidateCatalog, loadCatalog, type NameDoc } from "@/lib/namesStore";

/**
 * GET /api/names — jumlah akar & epithet.
 * GET /api/names?full=1 — seluruh katalog (dipakai browser sekali per sesi, di-cache CDN).
 */
export async function GET(req: NextRequest) {
  try {
    const { roots, epithets } = await loadCatalog();
    if (req.nextUrl.searchParams.get("full") === "1") {
      return NextResponse.json(
        { roots, epithets },
        { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
      );
    }
    return NextResponse.json(
      { roots: roots.length, epithets: epithets.length, total: roots.length + epithets.length },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ error: "DB_UNAVAILABLE" }, { status: 503 });
  }
}

const WORD_RE = /^[a-z]{3,52}$/;

/**
 * POST /api/names — tambah kata baru tanpa deploy (butuh CRON_SECRET).
 * Body: { word, meaning, origin?, kind?: "root" | "epithet" }
 */
export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  let body: { word?: string; meaning?: string; origin?: string; kind?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const word = (body.word || "").trim().toLowerCase();
  const meaning = (body.meaning || "").trim();
  const origin = (body.origin || "greek").trim();
  const kind = body.kind === "epithet" ? "epithet" : "root";

  if (!WORD_RE.test(word)) {
    return NextResponse.json({ error: "INVALID_WORD" }, { status: 400 });
  }
  if (meaning.length < 3 || meaning.length > 120) {
    return NextResponse.json({ error: "INVALID_MEANING" }, { status: 400 });
  }

  try {
    const db = await getDb();
    const doc: NameDoc = { word, meaning, origin, kind, createdAt: new Date() };
    await db.collection<NameDoc>("names").insertOne(doc);
    invalidateCatalog();
    return NextResponse.json({ ok: true, word, kind }, { status: 201 });
  } catch (e) {
    if ((e as { code?: number }).code === 11000) {
      return NextResponse.json({ error: "DUPLICATE_WORD" }, { status: 409 });
    }
    return NextResponse.json({ error: "DB_UNAVAILABLE" }, { status: 503 });
  }
}
