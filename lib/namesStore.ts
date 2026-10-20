import type { Collection } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { EPITHETS, NAME_SEEDS, type NameSeed } from "@/lib/names";

export type NameDoc = NameSeed & { kind: "root" | "epithet"; createdAt?: Date };

type Catalog = { roots: NameSeed[]; epithets: NameSeed[]; at: number };

const TTL_MS = 5 * 60 * 1000;
let cache: Catalog | null = null;

const projection = { _id: 0, word: 1, meaning: 1, origin: 1 } as const;

async function seedIfEmpty(col: Collection<NameDoc>): Promise<void> {
  const count = await col.estimatedDocumentCount();
  if (count > 0) return;
  const docs: NameDoc[] = [
    ...NAME_SEEDS.map((seed) => ({ ...seed, kind: "root" as const, createdAt: new Date() })),
    ...EPITHETS.map((seed) => ({ ...seed, kind: "epithet" as const, createdAt: new Date() })),
  ];
  // ordered:false → duplikat kata (kalau ada dua instance seed bersamaan) tidak menggagalkan sisanya.
  await col.insertMany(docs, { ordered: false }).catch(() => null);
}

/** Katalog nama; cache 5 menit per instance supaya tidak query tiap request. */
export async function loadCatalog(force = false): Promise<Catalog> {
  if (!force && cache && Date.now() - cache.at < TTL_MS) return cache;

  const db = await getDb();
  const col = db.collection<NameDoc>("names");
  await col.createIndex({ kind: 1 }, { unique: false }).catch(() => null);
  await col.createIndex({ word: 1 }, { unique: true }).catch(() => null);
  await seedIfEmpty(col);

  const [roots, epithets] = await Promise.all([
    col.find({ kind: "root" }, { projection }).toArray(),
    col.find({ kind: "epithet" }, { projection }).toArray(),
  ]);

  cache = { roots, epithets, at: Date.now() };
  return cache;
}

export function invalidateCatalog(): void {
  cache = null;
}
