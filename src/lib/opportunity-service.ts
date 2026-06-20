import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { generateOpportunity, ensureSeeded, getHistory, pruneExpired } from "@/lib/opportunity-engine";
import type { Opportunity } from "@/lib/types";

const PLAN_RANK: Record<string, number> = { DECOUVERTE: 1, PRO: 2, INSTITUTIONNEL: 3 };
function rankFor(code?: string | null) {
  return PLAN_RANK[code || "DECOUVERTE"] ?? 1;
}

export type EnrichedOpportunity = Opportunity & { lockedForHigherPlan?: boolean };

export type OpportunityFilters = {
  platform?: string;
  pair?: string;
  type?: string;
  minProfit?: number;
  limit?: number;
};

/**
 * Génère et filtre les opportunités visibles pour l'utilisateur courant.
 * Utilisé par l'API /api/opportunities ET par le SSR de la page d'accueil
 * (afin que Google et les visiteurs voient des opportunités réelles immédiatement).
 */
export async function getVisibleOpportunities(filters: OpportunityFilters = {}): Promise<{
  opportunities: EnrichedOpportunity[];
  total: number;
  lockedCount: number;
  plan: { code: string; name: string; isRealTime: boolean; delaySeconds: number };
}> {
  ensureSeeded();
  pruneExpired();

  const user = await getCurrentUser();
  const userPlan = user?.plan;
  const userRank = rankFor(userPlan?.code);
  const userDelay = userPlan?.delaySeconds ?? 300;

  const platforms = await db.platform.findMany();
  const platformMap = new Map(platforms.map((p) => [p.code, p]));

  const now = Date.now();
  let snapshot = getHistory().slice(0, 50).filter((op) => new Date(op.expiresAt).getTime() > now);

  // Génère des opportunités d'âges variés (certaines plus anciennes que le délai du plan)
  if (snapshot.length < 12) {
    const generated = [];
    for (let i = 0; i < 24; i++) {
      const ageSec = 30 + i * 33 + Math.random() * 20;
      const createdAt = new Date(now - ageSec * 1000);
      const op = generateOpportunity(createdAt);
      op.expiresAt = new Date(now + (90 + Math.random() * 300) * 1000).toISOString();
      if (userRank <= 1 && op.type === "SPOT" && op.profitPercent <= 2.5 && i % 2 === 0) {
        op.requiresPlan = "DECOUVERTE";
      }
      generated.push(op);
    }
    snapshot = [...generated, ...snapshot];
  }

  // Délai du plan
  snapshot = snapshot.filter((op) => {
    const ageSec = (now - new Date(op.createdAt).getTime()) / 1000;
    return ageSec >= userDelay;
  });

  // Gating par plan
  snapshot = snapshot.filter((op) => {
    if (rankFor(op.requiresPlan) > userRank) return false;
    if (op.type === "P2P" && !userPlan?.hasP2PFiat) return false;
    return true;
  });

  // Filtres utilisateur
  if (filters.platform) {
    snapshot = snapshot.filter(
      (op) => op.buyPlatformCode === filters.platform || op.sellPlatformCode === filters.platform
    );
  }
  if (filters.pair) {
    snapshot = snapshot.filter((op) => op.pair.toLowerCase().includes(filters.pair!.toLowerCase()));
  }
  if (filters.type) {
    snapshot = snapshot.filter((op) => op.type === filters.type!.toUpperCase());
  }
  if (filters.minProfit && filters.minProfit > 0) {
    snapshot = snapshot.filter((op) => op.profitPercent >= filters.minProfit!);
  }

  const limit = Math.min(filters.limit ?? 40, 100);
  const showVolume = userPlan?.hasVolume === true;

  const data: EnrichedOpportunity[] = snapshot.slice(0, limit).map((op) => {
    const buyP = platformMap.get(op.buyPlatformCode);
    const sellP = platformMap.get(op.sellPlatformCode);
    return {
      ...op,
      buyPlatform: buyP
        ? { code: buyP.code, name: buyP.name, color: buyP.color, logo: buyP.logo }
        : { code: op.buyPlatformCode, name: op.buyPlatformCode, color: "#7c3aed", logo: "?" },
      sellPlatform: sellP
        ? { code: sellP.code, name: sellP.name, color: sellP.color, logo: sellP.logo }
        : { code: op.sellPlatformCode, name: op.sellPlatformCode, color: "#c026d3", logo: "?" },
      volume: showVolume ? op.volume : null,
      lockedForHigherPlan: false,
    };
  });

  const allOps = getHistory();
  const lockedCount = allOps.filter((op) => {
    return rankFor(op.requiresPlan) > userRank || (op.type === "P2P" && !userPlan?.hasP2PFiat);
  }).length;

  return {
    opportunities: data,
    total: data.length,
    lockedCount,
    plan: userPlan
      ? { code: userPlan.code, name: userPlan.name, isRealTime: userPlan.isRealTime, delaySeconds: userPlan.delaySeconds }
      : { code: "DECOUVERTE", name: "Découverte", isRealTime: false, delaySeconds: 300 },
  };
}
