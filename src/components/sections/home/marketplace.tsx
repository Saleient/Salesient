"use client";

import { ArrowUpRight, Plug, Search, X } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { LoadingGrid } from "@/components/ui/loading-spinner";
import { apps as composioApps } from "@/lib/data";
import { cn } from "@/lib/utils";

type ComposioApp = {
  id: string;
  appName: string;
  description: string;
  logo: string;
  toolkitSlug: string;
  categories: string[];
  meta: {
    description: string;
    logo: string;
  };
};

function AppLogo({ app }: { app: ComposioApp }) {
  const [error, setError] = useState(false);
  const slug = app.toolkitSlug?.toLowerCase() || "";
  const logoSrc = `/integrations/logos/${slug}.svg`;

  if (error) {
    return (
      <span className="font-semibold text-base text-white">
        {app.appName.charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    // biome-ignore lint/performance/noImgElement: integration logo
    // biome-ignore lint/correctness/useImageSize: CSS-controlled
    <img
      alt={app.appName}
      className="h-full w-full object-contain"
      src={logoSrc}
      loading="lazy"
      onError={() => setError(true)}
    />
  );
}

export default function LandingIntegrations() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const ALLOWED_CATEGORIES = [
    "sales & customer support",
    "crm",
    "erp",
    "email marketing",
    "marketing & social media",
    "productivity & project management",
    "productivity",
    "collaboration & communication",
    "scheduling & booking",
    "marketing",
    "sales automation",
    "contact management",
    "lead generation",
    "communication",
    "messaging",
    "customer onboarding",
    "professional services",
    "sales engagement",
    "b2b sales intelligence",
    "digital marketing",
    "advertising & marketing",
    "email automation",
    "survey",
    "customer management",
    "sales",
    "scheduling",
    "collaboration",
    "workflow automation",
    "analytics & data",
  ];

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const marketplaceApps = composioApps.apps.filter((app: ComposioApp) => {
    const matchesSearch =
      !searchQuery ||
      app.appName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase());
    const hasAllowedCategory = app.categories.some((cat) =>
      ALLOWED_CATEGORIES.includes(cat.toLowerCase())
    );
    return matchesSearch && hasAllowedCategory;
  });

  const groupAppsByCategory = (
    appsToGroup: ComposioApp[]
  ): Record<string, ComposioApp[]> =>
    appsToGroup.reduce(
      (acc, app) => {
        const allowedAppCategories = app.categories.filter((cat) =>
          ALLOWED_CATEGORIES.includes(cat.toLowerCase())
        );

        if (allowedAppCategories.length === 0) {
          return acc;
        }

        for (const category of allowedAppCategories) {
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(app);
        }
        return acc;
      },
      {} as Record<string, ComposioApp[]>
    );

  const categorizedApps = groupAppsByCategory(marketplaceApps);
  const sortedCategories = Object.keys(categorizedApps).sort();
  const visibleCategories =
    selectedCategory === "all"
      ? sortedCategories
      : sortedCategories.filter((c) => c === selectedCategory);

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  const renderAppCard = (app: ComposioApp) => (
    <div
      className="group flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#09090c] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-white/16"
      key={app.toolkitSlug}
    >
      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] p-2">
            <AppLogo app={app} />
          </div>
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] text-emerald-400">
            OAuth 2.0
          </span>
        </div>

        <h3 className="font-semibold text-sm text-white group-hover:text-zinc-100 sm:text-base">
          {app.appName}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-xs text-zinc-400 leading-relaxed">
          {app.meta.description}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5 border-t border-white/[0.06] pt-3">
        {app.categories.slice(0, 2).map((category) => (
          <span
            className="inline-block rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-0.5 font-mono text-[10px] text-zinc-400"
            key={category}
          >
            {category}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#050507] px-4 pt-32 pb-20 text-white sm:px-6 md:pt-40 md:pb-28 lg:px-8">
      {/* Subtle Architectural Grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grid-subtle [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000_25%,transparent_100%)]"
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 font-mono text-[11px] uppercase tracking-wider text-zinc-400"
          >
            <Plug className="h-3.5 w-3.5 text-zinc-300" />
            <span>Integration Directory</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.06 }}
            className="font-semibold text-4xl tracking-[-0.03em] text-white sm:text-5xl md:text-6xl"
          >
            Connect your entire{" "}
            <span className="text-zinc-500">revenue stack.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="mx-auto mt-4 max-w-xl text-sm text-zinc-400 leading-relaxed sm:text-base"
          >
            Sync CRMs, cloud repositories, and messaging workspaces into a
            unified RAG index in minutes.
          </motion.p>

          {/* Search & Filter Controls */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18 }}
            className="mx-auto mt-8 max-w-lg"
          >
            <div className="relative">
              <Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 text-zinc-500" />
              <Input
                className="h-11 rounded-xl border-white/10 bg-[#09090c] pr-10 pl-10 text-sm text-white placeholder:text-zinc-500 focus:border-white/25"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 120+ connectors by name or workflow..."
                type="text"
                value={searchQuery}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="-translate-y-1/2 absolute top-1/2 right-3 rounded-md p-1 text-zinc-500 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Category Filter Pills */}
        {!loading && sortedCategories.length > 0 && (
          <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={cn(
                "shrink-0 cursor-pointer rounded-full border px-3.5 py-1.5 font-mono text-xs transition-colors",
                selectedCategory === "all"
                  ? "border-white/20 bg-white text-black font-semibold"
                  : "border-white/[0.08] bg-[#09090c] text-zinc-400 hover:border-white/15 hover:text-white"
              )}
            >
              All ({marketplaceApps.length})
            </button>
            {sortedCategories.slice(0, 8).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "shrink-0 cursor-pointer rounded-full border px-3.5 py-1.5 text-xs capitalize transition-colors",
                  selectedCategory === cat
                    ? "border-white/20 bg-white text-black font-semibold"
                    : "border-white/[0.08] bg-[#09090c] text-zinc-400 hover:border-white/15 hover:text-white"
                )}
              >
                {cat} ({categorizedApps[cat].length})
              </button>
            ))}
          </div>
        )}

        {/* Apps Grid */}
        <div className="mt-12 space-y-14">
          {(() => {
            if (loading) {
              return <LoadingGrid count={8} />;
            }
            if (marketplaceApps.length === 0) {
              return (
                <div className="rounded-2xl border border-white/[0.08] bg-[#09090c] py-16 text-center">
                  <Search className="mx-auto mb-3 h-8 w-8 text-zinc-600" />
                  <p className="font-medium text-sm text-zinc-300">
                    {searchQuery
                      ? `No integrations matching "${searchQuery}"`
                      : "No integrations available."}
                  </p>
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="mt-3 text-xs text-zinc-400 underline underline-offset-4 hover:text-white"
                    >
                      Clear search filter
                    </button>
                  )}
                </div>
              );
            }
            return visibleCategories.map((category) => (
              <div key={category}>
                <div className="mb-5 flex items-center justify-between border-b border-white/[0.07] pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <h2 className="font-semibold text-base text-white capitalize sm:text-lg">
                      {category}
                    </h2>
                  </div>
                  <span className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-0.5 font-mono text-xs text-zinc-400">
                    {categorizedApps[category].length} connectors
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {categorizedApps[category].map((app) => renderAppCard(app))}
                </div>
              </div>
            ));
          })()}
        </div>

        {/* Custom Integration Request Banner */}
        {!loading && marketplaceApps.length > 0 && (
          <div className="mt-20 flex flex-col items-center justify-between gap-6 rounded-2xl border border-white/[0.08] bg-[#09090c] p-8 sm:flex-row sm:p-10">
            <div>
              <h2 className="font-semibold text-xl text-white sm:text-2xl">
                Need a custom internal connector or webhook?
              </h2>
              <p className="mt-1.5 max-w-xl text-xs text-zinc-400 leading-relaxed sm:text-sm">
                Our engineering team builds custom MCP and REST connectors for
                proprietary data warehouses and legacy ERPs.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-6 py-3 font-semibold text-xs text-black transition-colors hover:bg-zinc-200"
            >
              <span>Request Connector</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
