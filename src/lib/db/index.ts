import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type DB = PostgresJsDatabase<typeof schema>;
const g = globalThis as unknown as { __ppDb?: DB; __ppSql?: ReturnType<typeof postgres> };

/** DATABASE_URL, or the POSTGRES_URL that Vercel's Postgres integrations provide. */
export function databaseUrl() {
  return process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? "";
}

export function sqlClient() {
  if (!g.__ppSql) {
    const url = databaseUrl();
    if (!url) throw new Error("DATABASE_URL is not set");
    const serverless = !!process.env.VERCEL;
    // Pooled (PgBouncer) connections don't support prepared statements across requests.
    const pooled = /-pooler\.|pgbouncer=true|:6543\//.test(url) || process.env.DB_PREPARE === "false";
    g.__ppSql = postgres(url, {
      max: Number(process.env.DB_POOL_MAX ?? (serverless ? 3 : 10)),
      idle_timeout: serverless ? 10 : 30,
      prepare: !pooled,
      onnotice: () => {},
    });
  }
  return g.__ppSql;
}

function getDb(): DB {
  if (!g.__ppDb) g.__ppDb = drizzle(sqlClient(), { schema });
  return g.__ppDb;
}

/** Lazily connected so builds don't need a database. */
export const db = new Proxy({} as DB, {
  get(_t, prop) {
    const real = getDb() as unknown as Record<string | symbol, unknown>;
    const v = real[prop];
    return typeof v === "function" ? (v as (...a: unknown[]) => unknown).bind(real) : v;
  },
});

export { schema };
