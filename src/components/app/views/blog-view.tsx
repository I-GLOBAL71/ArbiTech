"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BLOG_ARTICLES, type BlogArticle } from "@/lib/blog-content";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Calendar,
  BookOpen,
  Search,
  Tag,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

const CATEGORY_TONES: Record<string, string> = {
  Débutant: "bg-teal-500/15 text-teal-300 border-teal-500/30",
  "P2P & FCFA": "bg-violet-500/15 text-violet-300 border-violet-500/30",
  Stratégies: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30",
  Ambassadeur: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  Sécurité: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  Guides: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
};

export function BlogView() {
  const setView = useApp((s) => s.setView);
  const [active, setActive] = useState<BlogArticle | null>(null);
  const [filter, setFilter] = useState<string>("ALL");
  const [query, setQuery] = useState<string>("");

  const categories = ["ALL", ...Array.from(new Set(BLOG_ARTICLES.map((a) => a.category)))];

  const filtered = BLOG_ARTICLES.filter((a) => {
    if (filter !== "ALL" && a.category !== filter) return false;
    if (query) {
      const q = query.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.keywords.some((k) => k.includes(q))
      );
    }
    return true;
  });

  // Article detail view
  if (active) {
    return (
      <article className="container mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
        <button
          onClick={() => setActive(null)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Retour au blog
        </button>

        <div className="animate-rise">
          <Badge className={`mb-4 border ${CATEGORY_TONES[active.category]}`}>
            <Tag className="w-3 h-3 mr-1" /> {active.category}
          </Badge>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight mb-4">
            {active.title}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-5">{active.excerpt}</p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 pb-6 border-b border-white/10">
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(active.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {active.readTime} de lecture</span>
          </div>

          <div className="prose-arbitech space-y-5">
            {active.content.map((para, i) => (
              <Paragraph key={i} text={para} />
            ))}
          </div>

          {/* CTA */}
          <div className="mt-10 rounded-2xl glass-strong p-6 text-center">
            <Sparkles className="w-7 h-7 text-violet-400 mx-auto mb-3" />
            <h3 className="font-display text-xl font-bold mb-2">Prêt à passer à l'action ?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              ArbiTech détecte les opportunités pour vous, en temps réel. Commencez gratuitement.
            </p>
            <Button
              onClick={() => setView("auth")}
              className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-0"
            >
              Créer mon compte gratuit <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </article>
    );
  }

  // Blog list view
  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
      <button
        onClick={() => setView("landing")}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
      </button>

      <header className="mb-10 max-w-2xl">
        <Badge className="mb-4 bg-violet-500/15 text-violet-200 border border-violet-500/30">
          <BookOpen className="w-3 h-3 mr-1" /> Le blog ArbiTech
        </Badge>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold mb-4">
          Apprenez l'arbitrage crypto <span className="text-aurora">sans jargon</span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Des guides simples, pensés pour tout le monde. Que vous découvriez la crypto ou que vous cherchiez à
          optimiser vos gains P2P en FCFA, vous trouverez votre bonheur ici.
        </p>
      </header>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un article…"
            className="w-full h-11 pl-9 pr-3 rounded-lg glass border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scroll-elegant pb-1">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === c
                  ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white"
                  : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              {c === "ALL" ? "Tous" : c}
            </button>
          ))}
        </div>
      </div>

      {/* Articles grid */}
      {filtered.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground">Aucun article ne correspond à votre recherche.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((article, i) => (
            <button
              key={article.slug}
              onClick={() => {
                setActive(article);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="text-left glass rounded-2xl p-5 hover:glass-strong hover:-translate-y-1 transition-all group animate-rise"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <Badge className={`mb-3 border ${CATEGORY_TONES[article.category]}`}>
                {article.category}
              </Badge>
              <h2 className="font-display text-lg font-bold mb-2 group-hover:text-aurora transition-colors leading-snug">
                {article.title}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">{article.excerpt}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {article.readTime}</span>
                <span className="flex items-center gap-1">
                  Lire l'article <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Newsletter CTA */}
      <div className="mt-12 rounded-2xl glass-strong gradient-border p-8 text-center">
        <h3 className="font-display text-2xl font-bold mb-2">Ne manquez aucun guide</h3>
        <p className="text-muted-foreground mb-5 max-w-md mx-auto">
          Créez un compte gratuit pour être prévenu de chaque nouvel article et profiter des opportunités en direct.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => setView("auth")} className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-0">
            Créer mon compte <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
          <Button variant="outline" onClick={() => setView("tools")}>
            Voir les outils gratuits
          </Button>
        </div>
      </div>
    </div>
  );
}

// Mini moteur de rendu markdown-lite pour **gras** et listes -
function Paragraph({ text }: { text: string }) {
  // Listes
  if (text.startsWith("- ")) {
    const items = text.split("\n").filter((l) => l.startsWith("- "));
    return (
      <ul className="space-y-2 pl-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 leading-relaxed">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
            <span dangerouslySetInnerHTML={{ __html: inline(item.slice(2)) }} />
          </li>
        ))}
      </ul>
    );
  }
  return <p className="leading-relaxed text-foreground/90" dangerouslySetInnerHTML={{ __html: inline(text) }} />;
}

function inline(text: string) {
  // **gras**
  return text.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>');
}
