"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { BASE_ASSETS } from "@/lib/constants";

type TickerItem = {
  symbol: string;
  name: string;
  price: number;
  change: number; // %
  currency: "FCFA" | "USDT";
};

const BASE_TICKER: TickerItem[] = BASE_ASSETS.map((a) => ({
  symbol: a.symbol,
  name: a.name,
  price: a.basePriceFcfa,
  change: (Math.random() - 0.5) * 4,
  currency: "FCFA" as const,
}));

function formatTickerPrice(value: number, currency: string) {
  if (currency === "FCFA") {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1000) return value.toLocaleString("fr-FR", { maximumFractionDigits: 0 });
    return value.toFixed(2);
  }
  return value.toFixed(value < 1 ? 6 : 2);
}

export function PriceTicker() {
  const [items, setItems] = useState<TickerItem[]>(BASE_TICKER);

  // Micro-fluctuations pseudo temps réel (jitter doux)
  useEffect(() => {
    const interval = setInterval(() => {
      setItems((prev) =>
        prev.map((it) => {
          const drift = (Math.random() - 0.5) * 0.008; // ±0.4%
          const newPrice = it.price * (1 + drift);
          const newChange = it.change + drift * 100;
          return { ...it, price: newPrice, change: Math.max(-8, Math.min(8, newChange)) };
        })
      );
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  // Duplique la liste pour un scroll infini fluide (translateX -50%)
  const looped = [...items, ...items];

  return (
    <div className="relative overflow-hidden border-y border-white/5 bg-background/40 py-3 select-none">
      {/* Fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-background to-transparent z-10" />

      <div className="flex w-max animate-ticker gap-8 px-4">
        {looped.map((it, i) => {
          const up = it.change >= 0;
          return (
            <div key={i} className="flex items-center gap-2.5 whitespace-nowrap">
              <span className="font-mono font-bold text-sm">{it.symbol}</span>
              <span className="text-muted-foreground text-xs hidden sm:inline">{it.name}</span>
              <span className="font-semibold text-sm tabular-nums">
                {formatTickerPrice(it.price, it.currency)} <span className="text-[10px] text-muted-foreground">{it.currency}</span>
              </span>
              <span
                className={`flex items-center gap-0.5 text-xs font-medium tabular-nums ${up ? "text-emerald-400" : "text-rose-400"}`}
              >
                {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {up ? "+" : ""}{it.change.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
