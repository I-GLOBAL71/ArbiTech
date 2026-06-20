import { NextRequest } from "next/server";
import { ok, handleErr } from "@/lib/http";
import { getVisibleOpportunities } from "@/lib/opportunity-service";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const result = await getVisibleOpportunities({
      platform: url.searchParams.get("platform") || undefined,
      pair: url.searchParams.get("pair") || undefined,
      type: url.searchParams.get("type") || undefined,
      minProfit: parseFloat(url.searchParams.get("minProfit") || "0") || 0,
      limit: parseInt(url.searchParams.get("limit") || "40", 10) || 40,
    });

    return ok({
      ...result,
      serverTime: new Date().toISOString(),
      websocketHint: "Pour le temps réel, connectez-vous au flux WebSocket (?XTransformPort=3003).",
    });
  } catch (e) {
    return handleErr(e);
  }
}
