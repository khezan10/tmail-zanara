import { MongoClient, type Db } from "mongodb";

const dbName = process.env.MONGODB_DB || "tmail";

declare global {
  var __tmailClient: Promise<MongoClient> | undefined;
  var __tmailIndexes: Promise<void> | undefined;
}

function client(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI belum disetel");
  if (!global.__tmailClient) {
    global.__tmailClient = new MongoClient(uri, {
      serverSelectionTimeoutMS: 8000,
    }).connect();
  }
  return global.__tmailClient;
}

export function ensureIndexes(db: Db): Promise<void> {
  if (!global.__tmailIndexes) {
    global.__tmailIndexes = (async () => {
      await db.collection("domains").createIndex({ domain: 1 }, { unique: true });
      await db.collection("messages").createIndex({ address: 1, receivedAt: -1 });
      await db.collection("messages").createIndex({ domain: 1 });
    })();
  }
  return global.__tmailIndexes;
}

export async function getDb(): Promise<Db> {
  const c = await client();
  const db = c.db(dbName);
  await ensureIndexes(db);
  return db;
}
