import { NextRequest, NextResponse } from "next/server";
import { fetchMarketSnapshot, getLatestSnapshot } from "@/lib/exchange-fetcher";
import { getScraperHealth } from "@/lib/arbitrage-calculator";

// Vercel Cron Job — réchauffe le cache des prix de marché toutes les minutes.
// Sans processus persistant en serverless, ce cron garantit que les opportunités
// sont toujours fraîches quand un utilisateur arrive.

export const dynamic = "force-dynamic";
export const maxDuration = 30; // Vercel serverless function timeout

export async function GET(req: NextRequest) {
  // Vérifie le secret pour empêcher l'abus (configuré dans Vercel env vars)
  const authHeader = req.headers.get("authorization");
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");
  const expectedSecret = process.env.CRON_SECRET || "CHANGE_ME_IN_VERCEL_ENV";

  // Vercel Cron envoie un header Authorization: Bearer <CRON_SECRET>
  const providedSecret = authHeader?.replace("Bearer ", "") || secret;
  if (providedSecret !== expectedSecret) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const snapshot = getLatestSnapshot();
    const now = Date.now();
    const isStale = !snapshot || now - snapshot.fetchedAt > 30000;

    if (isStale) {
      const fresh = await fetchMarketSnapshot();
      const health = getScraperHealth(fresh);
      return NextResponse.json({
        ok: true,
        action: "fetched",
        sources: fresh.sources,
        opportunityCount: health.opportunityCount,
        errors: fresh.errors,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      ok: true,
      action: "cache_hit",
      ageMs: now - snapshot!.fetchedAt,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: String(e).slice(0, 200) },
      { status: 500 }
    );
  }
}
