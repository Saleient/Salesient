"use client";

import { Plug, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { InView } from "@/components/ui/in-view";
import { Input } from "@/components/ui/input";
import { LoadingGrid } from "@/components/ui/loading-spinner";
import { apps as composioApps } from "@/lib/data";

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

export default function LandingIntegrations() {
  const [searchQuery, setSearchQuery] = useState("");
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
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Get all marketplace apps (matching landing page criteria)
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

  // Group apps by category
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

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  const renderAppCard = (app: ComposioApp) => (
    <div
      className="group rounded-xl border border-neutral-800 bg-neutral-900 p-4 shadow-sm transition-all duration-300 hover:border-neutral-700 hover:shadow-md sm:p-6"
      key={app.toolkitSlug}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-800 bg-neutral-800 sm:h-14 sm:w-14">
          {app.meta.logo ? (
            // biome-ignore lint/performance/noImgElement: <explanation>
            // biome-ignore lint/correctness/useImageSize: <explanation>
            <img
              alt={app.appName}
              className="h-10 w-10 object-contain sm:h-12 sm:w-12"
              src={app.meta.logo}
            />
          ) : null}
          <span
            className={`font-semibold text-lg text-neutral-100 ${
              app.meta.logo ? "hidden" : ""
            }`}
          >
            {getInitial(app.appName)}
          </span>
        </div>
      </div>

      <div className="mb-4 flex-1">
        <h3 className="mb-1 font-semibold text-base text-neutral-100">
          {app.appName}
        </h3>
        <p className="text-neutral-300 text-sm">{app.meta.description}</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {app.categories.slice(0, 2).map((category) => (
          <span
            className="inline-block rounded-full bg-neutral-800 px-2.5 py-1 font-medium text-neutral-300 text-xs"
            key={category}
          >
            {category}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center bg-background px-5 pt-24 sm:px-10 md:pt-32">
      <div className="mx-auto w-full max-w-[1440px]">
        {/* Header */}
        <div className="mb-12 flex flex-col items-center justify-center gap-6 text-center">
          <InView className="w-full">
            <h1 className="font-medium text-4xl text-neutral-100 leading-tight md:text-5xl lg:text-6xl">
              Connect with 120+ Integrations
            </h1>
          </InView>

          <InView className="w-full">
            <p className="max-w-2xl text-base text-neutral-300 md:text-lg mx-auto">
              Connect your favorite tools and platforms to create a seamless
              workflow. Browse our extensive library of integrations or request
              one that's not listed.
            </p>
          </InView>

          {/* Search Bar */}
          <div className="relative w-full max-w-md">
            <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-5 w-5 transform text-neutral-400" />
            <Input
              className="border-neutral-800 bg-neutral-900 pl-10 text-neutral-100 placeholder-neutral-400 shadow-sm transition-all duration-300 hover:border-neutral-700 focus:border-neutral-600"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search integrations..."
              type="text"
              value={searchQuery}
            />
          </div>
        </div>

        {/* Apps Grid */}
        <div className="space-y-12">
          {(() => {
            if (loading) {
              return <LoadingGrid count={8} />;
            }
            if (marketplaceApps.length === 0) {
              return (
                <div className="rounded-lg border border-neutral-800 bg-neutral-900 py-12 text-center shadow-sm">
                  <Search className="mx-auto mb-4 h-12 w-12 text-neutral-600" />
                  <p className="text-neutral-300">
                    {searchQuery
                      ? "No integrations found matching your search."
                      : "No integrations available."}
                  </p>
                </div>
              );
            }
            return sortedCategories.map((category) => (
              <div key={category}>
                <div className="mb-6 flex items-center gap-3">
                  <Plug className="h-5 w-5 text-neutral-400" />
                  <h2 className="font-medium text-lg text-neutral-100 capitalize md:text-xl">
                    {category}
                  </h2>
                  <span className="ml-auto rounded-full bg-neutral-800 px-3 py-1 font-medium text-neutral-300 text-xs">
                    {categorizedApps[category].length}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {categorizedApps[category].map((app) => renderAppCard(app))}
                </div>
              </div>
            ));
          })()}
        </div>

        {/* CTA Section */}
        {!loading && marketplaceApps.length > 0 && (
          <InView className="mt-16 flex flex-col items-center justify-center gap-6 rounded-2xl border border-neutral-800 bg-neutral-900 px-6 py-12 text-center shadow-sm md:px-12 md:py-16">
            <h2 className="font-medium text-2xl text-neutral-100 md:text-3xl">
              Don't see what you need?
            </h2>
            <p className="max-w-xl text-neutral-300">
              We're always adding new integrations. Request a platform and we'll
              work on making it available for you.
            </p>
            <a
              href="https://cal.com/sahilgulati41/15min"
              className="rounded-lg border border-neutral-800 bg-neutral-800 px-6 py-3 font-medium text-neutral-100 transition-all duration-300 hover:border-neutral-700 hover:bg-neutral-700"
              type="button"
            >
              Request Integration
            </a>
          </InView>
        )}
      </div>
    </section>
  );
}
