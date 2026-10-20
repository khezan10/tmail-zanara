import { NextResponse } from "next/server";
import { composeIdentity, randomPick, type NameSeed } from "@/lib/names";
import { loadCatalog } from "@/lib/namesStore";

/** GET /api/names/random — satu nama dari katalog MongoDB (akal + epithet + sufiks). */
export async function GET() {
  try {
    const { roots, epithets } = await loadCatalog();
    if (roots.length === 0) throw new Error("EMPTY_CATALOG");

    const root = randomPick(roots);
    const epithet: NameSeed | undefined =
      epithets.length > 0 && randomPick([false, true]) ? randomPick(epithets) : undefined;

    return NextResponse.json(composeIdentity(root, epithet), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ error: "DB_UNAVAILABLE" }, { status: 503 });
  }
}
