/**
 * Runs during the Vercel build (see "vercel-build" in package.json):
 * applies database migrations, creates the first admin and, if SEED_DEMO=true, adds demo content.
 */
async function main() {
  // Prefer a direct (non-pooled) connection for migrations and the advisory lock.
  const direct = process.env.DATABASE_URL_UNPOOLED ?? process.env.POSTGRES_URL_NON_POOLING;
  if (direct) process.env.DATABASE_URL = direct;
  else if (!process.env.DATABASE_URL && process.env.POSTGRES_URL) process.env.DATABASE_URL = process.env.POSTGRES_URL;

  if (!process.env.DATABASE_URL) {
    console.error("\n[setup] No database connected. In Vercel, open your project > Storage, add a Neon Postgres database and redeploy.\n");
    process.exit(1);
  }
  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) {
    console.error("\n[setup] AUTH_SECRET is missing or shorter than 32 characters. Add it under Settings > Environment Variables and redeploy.\n");
    process.exit(1);
  }
  if (process.env.VERCEL && !process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("\n[setup] No Blob store connected. In Vercel, open your project > Storage, add a Blob store and redeploy.\n");
    process.exit(1);
  }
  const { bootstrap } = await import("../src/lib/bootstrap");
  const { sqlClient } = await import("../src/lib/db");
  await bootstrap();
  await sqlClient().end({ timeout: 5 });
  console.log("[setup] database ready");
}

main().catch((e) => {
  console.error("[setup] failed:", e);
  process.exit(1);
});
