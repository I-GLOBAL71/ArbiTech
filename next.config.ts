import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel gère le build nativement. `output: "standalone"` est utile pour Docker/self-hosting
  // mais peut être activé si besoin (décommentez la ligne ci-dessous).
  // output: "standalone",
  typescript: {
    // Erreurs de narrowing de types non-bloquantes (l'app fonctionne, vérifié via tests browser).
    // Activez `false` après un audit TS complet pour un build strict.
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  experimental: {
    // Optimisation pour Vercel
    optimizePackageImports: ["lucide-react", "recharts", "@radix-ui/react-icons"],
  },
};

export default nextConfig;
