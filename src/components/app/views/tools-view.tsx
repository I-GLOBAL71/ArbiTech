"use client";

import { useState, useMemo } from "react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowLeft,
  Calculator,
  Coins,
  BookText,
  TrendingUp,
  Zap,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Info,
} from "lucide-react";
import { formatFcfa, formatPercent, formatNumber } from "@/lib/format";
import { BASE_ASSETS } from "@/lib/constants";

const USDT_FCFA_RATE = 615; // taux de référence approximatif

export function ToolsView() {
  const setView = useApp((s) => s.setView);

  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12">
      <button
        onClick={() => setView("landing")}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
      </button>

      <header className="mb-10 max-w-2xl">
        <Badge className="mb-4 bg-emerald-500/15 text-emerald-200 border border-emerald-500/30">
          <Zap className="w-3 h-3 mr-1" /> Outils gratuits
        </Badge>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold mb-4">
          Vos outils crypto <span className="text-aurora">gratuits</span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Calculez vos profits, convertissez vos montants, comprenez les termes. Tout est gratuit, sans inscription.
        </p>
      </header>

      <div className="space-y-8">
        <ProfitCalculator />
        <UsdtFcfaConverter />
        <Glossary />
      </div>

      {/* CTA */}
      <div className="mt-12 rounded-2xl glass-strong gradient-border p-8 text-center">
        <Sparkles className="w-8 h-8 text-violet-400 mx-auto mb-3" />
        <h3 className="font-display text-2xl font-bold mb-2">Envie d'aller plus loin ?</h3>
        <p className="text-muted-foreground mb-5 max-w-md mx-auto">
          Ces outils sont gratuits. Mais pour des opportunités en temps réel, créez votre compte ArbiTech.
        </p>
        <Button onClick={() => setView("auth")} className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-0">
          Découvrir les opportunités en direct <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

/* ============ 1. Calculateur de profit d'arbitrage ============ */
function ProfitCalculator() {
  const [buyPrice, setBuyPrice] = useState<string>("615");
  const [sellPrice, setSellPrice] = useState<string>("628");
  const [volume, setVolume] = useState<string>("1000");
  const [fees, setFees] = useState<string>("1"); // % frais totaux (transfert + trading)

  const result = useMemo(() => {
    const bp = parseFloat(buyPrice) || 0;
    const sp = parseFloat(sellPrice) || 0;
    const vol = parseFloat(volume) || 0;
    const fee = parseFloat(fees) || 0;

    const grossProfit = (sp - bp) * vol;
    const grossPercent = bp > 0 ? ((sp - bp) / bp) * 100 : 0;
    const totalCost = bp * vol;
    const feeAmount = (totalCost * fee) / 100;
    const netProfit = grossProfit - feeAmount;
    const netPercent = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;
    const isProfit = netProfit > 0;

    return { grossProfit, grossPercent, netProfit, netPercent, feeAmount, totalCost, isProfit };
  }, [buyPrice, sellPrice, volume, fees]);

  return (
    <section className="glass-strong rounded-3xl p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-5">
        <div className="grid place-items-center w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold">Calculateur de profit d'arbitrage</h2>
          <p className="text-sm text-muted-foreground">Combien allez-vous gagner sur cette opportunité ?</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="space-y-1.5">
          <Label htmlFor="buy">Prix d'achat (par unité)</Label>
          <Input id="buy" type="number" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} placeholder="615" className="h-11" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sell">Prix de vente (par unité)</Label>
          <Input id="sell" type="number" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} placeholder="628" className="h-11" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="vol">Volume (quantité achetée)</Label>
          <Input id="vol" type="number" value={volume} onChange={(e) => setVolume(e.target.value)} placeholder="1000" className="h-11" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fees">Frais totaux estimés (%)</Label>
          <Input id="fees" type="number" step="0.1" value={fees} onChange={(e) => setFees(e.target.value)} placeholder="1" className="h-11" />
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Info className="w-3 h-3" /> Inclut frais de transfert + frais de trading
          </p>
        </div>
      </div>

      <div className={`rounded-2xl p-5 ${result.isProfit ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-rose-500/10 border border-rose-500/30"}`}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Metric label="Profit brut" value={formatFcfa(result.grossProfit, { compact: result.grossProfit > 100000 })} tone={result.isProfit ? "emerald" : "rose"} />
          <Metric label="Frais" value={formatFcfa(result.feeAmount, { compact: result.feeAmount > 100000 })} tone="muted" />
          <Metric label="Profit net" value={formatFcfa(result.netProfit, { compact: Math.abs(result.netProfit) > 100000 })} tone={result.isProfit ? "emerald" : "rose"} big />
          <Metric label="Rendement net" value={formatPercent(result.netPercent)} tone={result.isProfit ? "emerald" : "rose"} big />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {result.isProfit
            ? `✓ Opportunité rentable : vous gagnez ${formatFcfa(result.netProfit)} sur un capital de ${formatFcfa(result.totalCost, { compact: result.totalCost > 1000000 })}.`
            : `✗ Opportunité non rentable : les frais mangent le profit. Évitez.`}
        </p>
      </div>
    </section>
  );
}

/* ============ 2. Convertisseur USDT / FCFA ============ */
function UsdtFcfaConverter() {
  const [asset, setAsset] = useState<string>("USDT");
  const [amount, setAmount] = useState<string>("100");
  const [direction, setDirection] = useState<"crypto-to-fcfa" | "fcfa-to-crypto">("crypto-to-fcfa");

  const assetInfo = BASE_ASSETS.find((a) => a.symbol === asset) || BASE_ASSETS[0];
  const rate = assetInfo.basePriceFcfa; // prix en FCFA pour 1 unité

  const result = useMemo(() => {
    const amt = parseFloat(amount) || 0;
    if (direction === "crypto-to-fcfa") {
      return { value: amt * rate, label: `${formatNumber(amt, amt < 1 ? 6 : 2)} ${asset} =`, unit: "FCFA", display: formatFcfa(amt * rate) };
    }
    return { value: rate > 0 ? amt / rate : 0, label: `${formatFcfa(amt)} =`, unit: asset, display: formatNumber(rate > 0 ? amt / rate : 0, asset === "BTC" ? 6 : 2) };
  }, [amount, rate, direction, asset]);

  return (
    <section className="glass-strong rounded-3xl p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-5">
        <div className="grid place-items-center w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white">
          <Coins className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold">Convertisseur crypto ↔ FCFA</h2>
          <p className="text-sm text-muted-foreground">Combien vaut votre crypto en FCFA, et inversement ?</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setDirection("crypto-to-fcfa")}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${direction === "crypto-to-fcfa" ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white" : "glass text-muted-foreground"}`}
        >
          Crypto → FCFA
        </button>
        <button
          onClick={() => setDirection("fcfa-to-crypto")}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${direction === "fcfa-to-crypto" ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white" : "glass text-muted-foreground"}`}
        >
          FCFA → Crypto
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        <div className="space-y-1.5">
          <Label>Crypto</Label>
          <Select value={asset} onValueChange={setAsset}>
            <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
            <SelectContent>
              {BASE_ASSETS.map((a) => (
                <SelectItem key={a.symbol} value={a.symbol}>{a.symbol} — {a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="amt">{direction === "crypto-to-fcfa" ? `Quantité en ${asset}` : "Montant en FCFA"}</Label>
          <Input id="amt" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-11" />
        </div>
      </div>

      <div className="rounded-2xl bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-teal-500/10 border border-white/10 p-5 text-center">
        <div className="text-sm text-muted-foreground mb-1">{result.label}</div>
        <div className="font-display text-3xl sm:text-4xl font-extrabold text-aurora">
          {result.display} <span className="text-lg text-muted-foreground font-normal">{result.unit}</span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-2 flex items-center justify-center gap-1">
          <Info className="w-3 h-3" /> Taux indicatif : 1 {asset} ≈ {formatFcfa(rate)}
        </p>
      </div>
    </section>
  );
}

/* ============ 3. Glossaire crypto simple ============ */
function Glossary() {
  const terms = [
    { term: "Arbitrage", def: "Acheter une crypto sur une plateforme où elle est moins chère et la vendre sur une autre où elle est plus chère. Le profit, c'est la différence entre les deux prix." },
    { term: "USDT (Tether)", def: "Une crypto qui vaut toujours environ 1 dollar américain. C'est la monnaie la plus utilisée en Afrique pour passer du FCFA à la crypto, et inversement." },
    { term: "P2P (Peer-to-Peer)", def: "Échange direct entre deux personnes, sans intermédiaire. Sur Binance P2P, vous achetez/vendez de l'USDT contre du FCFA via Mobile Money, directement à un autre utilisateur." },
    { term: "Spot", def: "Le marché « classique » où vous achetez et vendez des cryptos au prix du marché, entre vos ordres et ceux des autres traders. Opposé au P2P." },
    { term: "FCFA (Franc CFA)", def: "La monnaie utilisée dans plusieurs pays d'Afrique francophone (Cameroun, Côte d'Ivoire, Sénégal, Mali…). 1 euro ≈ 656 FCFA. 1 USDT ≈ 615 FCFA." },
    { term: "Spread", def: "L'écart entre le prix d'achat et le prix de vente d'une crypto sur une même plateforme. Plus le spread est petit, plus la plateforme est liquide." },
    { term: "Wallet (Portefeuille)", def: "Un endroit pour stocker vos cryptos. Ça peut être sur une plateforme (Binance, Bybit…) ou dans une application dédiée (Trust Wallet, MetaMask)." },
    { term: "Ordre au marché", def: "Acheter ou vendre immédiatement au prix actuel. L'ordre est exécuté tout de suite. Opposé à l'ordre limite." },
    { term: "Ordre limite", def: "Vous fixez le prix exact auquel vous voulez acheter/vendre. L'ordre ne s'exécute que si le marché atteint ce prix." },
    { term: "Mobile Money", def: "Service de transfert d'argent via téléphone (MTN, Orange, Wave, Moov…). C'est le moyen le plus courant de payer en FCFA sur le marché P2P." },
    { term: "TRC20 / ERC20", def: "Deux réseaux pour transférer l'USDT. TRC20 (Tron) coûte environ 1 USDT de frais. ERC20 (Ethereum) peut coûter 5 à 20 USDT. Préférez toujours TRC20 pour l'arbitrage." },
    { term: "Liquidity (Liquidité)", def: "La facilité à acheter/vendre sans faire bouger le prix. Une plateforme très liquide (Binance) permet de gros volumes sans impact. Une plateforme peu liquide (petits échanges) a des écarts plus larges mais moins de volume disponible." },
    { term: "Pump & Dump", def: "Manipulation : on fait monter artificiellement le prix d'une petite crypto (pump), puis on revend en masse (dump), faisant chuter le prix et piégeant les acheteurs. Méfiez-vous des « opportunités » trop belles." },
    { term: "KYC", def: "« Know Your Customer » : la procédure de vérification d'identité demandée par les plateformes (pièce d'identité, selfie). Obligatoire sur Binance, Bybit, OKX, KuCoin pour utiliser pleinement le compte." },
  ];

  return (
    <section className="glass-strong rounded-3xl p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-5">
        <div className="grid place-items-center w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 text-white">
          <BookText className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold">Glossaire crypto pour débutants</h2>
          <p className="text-sm text-muted-foreground">Tous les termes, expliqués simplement.</p>
        </div>
      </div>

      <Accordion type="single" collapsible className="space-y-2">
        {terms.map((t, i) => (
          <AccordionItem key={i} value={`t-${i}`} className="glass rounded-xl px-4 border-0">
            <AccordionTrigger className="text-left font-semibold hover:no-underline">
              {t.term}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              {t.def}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

function Metric({ label, value, tone, big }: { label: string; value: string; tone: string; big?: boolean }) {
  const tones: Record<string, string> = {
    emerald: "text-emerald-400",
    rose: "text-rose-400",
    muted: "text-muted-foreground",
  };
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-0.5">{label}</div>
      <div className={`${big ? "text-xl sm:text-2xl" : "text-base"} font-bold ${tones[tone]}`}>{value}</div>
    </div>
  );
}
