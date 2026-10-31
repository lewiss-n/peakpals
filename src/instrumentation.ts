const RETRYABLE = new Set(["EAI_AGAIN", "ENOTFOUND", "ECONNREFUSED", "ECONNRESET", "ETIMEDOUT", "57P03"]);

export async function register() {
  // Keep the import inside this check so the edge build leaves the database code out.
  // On Vercel, setup runs once during the build (scripts/setup.ts) instead of on every cold start.
  if (process.env.NEXT_RUNTIME === "nodejs" && !process.env.VERCEL) {
    const { bootstrap } = await import("./lib/bootstrap");
    const attempts = Number(process.env.DB_CONNECT_RETRIES ?? 30);
    for (let i = 1; i <= attempts; i++) {
      try {
        await bootstrap();
        return;
      } catch (e) {
        const code = (e as { code?: string })?.code ?? "";
        if (RETRYABLE.has(code) && i < attempts) {
          console.warn(`[bootstrap] database not reachable yet (${code}), retrying in 2s (${i}/${attempts})`);
          await new Promise((r) => setTimeout(r, 2000));
          continue;
        }
        console.error("[bootstrap] failed:", e);
        if (process.env.NODE_ENV === "production") process.exit(1);
        return;
      }
    }
  }
}
