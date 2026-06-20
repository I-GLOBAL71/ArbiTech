"use client";

import { useEffect, useState } from "react";

/**
 * Affiche un texte dépendant du temps (relatif) sans mismatch d'hydration.
 *
 * Problème : `timeAgo(date)` / `timeUntil(date)` produisent des valeurs différentes
 * entre le rendu serveur et l'hydration client (le temps passe entre les deux),
 * ce qui provoque l'erreur React "Hydration failed because the server rendered
 * text didn't match the client".
 *
 * Solution : on rend un placeholder stable (émulé par `initial`) pendant le SSR,
 * puis la vraie valeur relative côté client après le montage. Une fois monté,
 * on re-rend toutes les `intervalMs` pour garder le texte à jour.
 */
export function TimeText({
  date,
  formatter,
  initial = "…",
  intervalMs = 1000,
  suppressHydrationWarning = true,
}: {
  date: Date | string | number | null | undefined;
  formatter: (d: Date) => string;
  initial?: string;
  intervalMs?: number;
  suppressHydrationWarning?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- mount flag for SSR hydration safety
  useEffect(() => setMounted(true), []);

  // Re-rend périodiquement pour garder le texte à jour (ex: "il y a 5s" → "il y a 6s")
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!mounted) return;
    const id = setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => clearInterval(id);
  }, [mounted, intervalMs]);

  if (!date) return <span suppressHydrationWarning={suppressHydrationWarning}>—</span>;
  const text = mounted ? formatter(new Date(date)) : initial;
  return <span suppressHydrationWarning={suppressHydrationWarning}>{text}</span>;
}
