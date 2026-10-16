"use client";

import { ArrowRight, Check, Layers, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const plans = [
  {
    title: "Free",
    badge: "Starter",
    tagline: "For individual reps & early evaluation",
    price: "$0",
    period: "per month · forever free",
    cta: "Start Free Workspace",
    highlight: false,
    features: [
      "Connect 1 live integration (e.g., Google Drive or Notion)",
      "Upload & index up to 100 documents / month",
      "Citation-backed AI deal assistant & email drafting",
      "Table & clause-aware PDF/DOCX parsing",
      "7-day query & activity history",
    ],
  },
  {
    title: "Team",
    badge: "Most Popular",
    tagline: "For high-velocity revenue teams up to 10 seats",
    price: "$49",
    period: "per month base, then +$15 / user / mo",
    cta: "Start Team Trial",
    highlight: true,
    features: [
      "Up to 5 concurrent CRM & cloud integrations",
      "Unlimited hybrid RAG search across shared vaults",
      "Auto-synced Deal Rooms & Competitive Battlecards",
      "Pre-call executive briefing generator",
      "Unlimited audit & citation history + priority support",
    ],
  },
  {
    title: "Enterprise",
    badge: "Custom Scale",
    tagline: "For security-driven organizations at scale",
    price: "Custom",
    period: "Annual commitment · volume seat tiers",
    cta: "Contact Sales",
    highlight: false,
    features: [
      "Unlimited native connectors & custom webhooks",
      "Dedicated single-tenant vector namespace isolation",
      "SOC 2 Type II, GDPR Art. 28 DPA & custom retention",
      "SAML SSO, SCIM provisioning & role-based ACLs",
      "Dedicated Solutions Engineer & 99.9% SLA guarantee",
    ],
  },
];

const comparisonRows = [
  {
    feature: "Hybrid Vector + BM25 Lexical Search",
    free: "Included",
    team: "Included",
    enterprise: "Dedicated Cluster",
  },
  {
    feature: "Deterministic Page & Clause Citations",
    free: "100% Attributed",
    team: "100% Attributed",
    enterprise: "100% Attributed",
  },
  {
    feature: "Connected Apps (Salesforce, Zoho, Slack, Drive)",
    free: "1 Connector",
    team: "Up to 5 Connectors",
    enterprise: "Unlimited + Custom",
  },
  {
    feature: "Indexed Document Capacity",
    free: "100 docs / mo",
    team: "5,000 docs / mo",
    enterprise: "Unlimited",
  },
  {
    feature: "Zero Model Training (ZDR Endpoints)",
    free: "Enforced",
    team: "Enforced",
    enterprise: "Enforced + Custom KMS",
  },
];

export default function Pricing() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050507] px-4 pt-32 pb-20 text-white sm:px-6 md:pt-40 md:pb-28 lg:px-8">
      {/* Subtle Architectural Grid & Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grid-subtle [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000_25%,transparent_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[780px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06)_0%,transparent_70%)] blur-2xl"
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 font-mono text-[11px] uppercase tracking-wider text-zinc-400"
          >
            <Layers className="h-3.5 w-3.5 text-zinc-300" />
            <span>Predictable Licensing</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.06 }}
            className="text-balance font-semibold text-4xl tracking-[-0.03em] text-white sm:text-5xl md:text-6xl"
          >
            Transparent pricing for{" "}
            <span className="text-zinc-500">revenue velocity.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="mx-auto mt-4 max-w-xl text-sm text-zinc-400 leading-relaxed sm:text-base"
          >
            Start indexing your playbooks and contracts for free. Upgrade when
            your team is ready for shared Deal Rooms and multi-CRM sync.
          </motion.p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.title}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.15 + idx * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={cn(
                "relative flex flex-col justify-between rounded-2xl border p-7 sm:p-8",
                plan.highlight
                  ? "border-white/25 bg-gradient-to-b from-white/[0.07] to-[#09090c] shadow-[0_24px_60px_-15px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.2)]"
                  : "border-white/[0.08] bg-[#09090c] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
              )}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-xl text-white">
                    {plan.title}
                  </h2>
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider",
                      plan.highlight
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : "border-white/10 bg-white/[0.03] text-zinc-400"
                    )}
                  >
                    {plan.badge}
                  </span>
                </div>

                <p className="mt-2 text-xs text-zinc-400">{plan.tagline}</p>

                <div className="mt-6 border-y border-white/[0.07] py-6">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-4xl tracking-tight text-white sm:text-5xl">
                      {plan.price}
                    </span>
                  </div>
                  <p className="mt-1.5 font-mono text-xs text-zinc-500">
                    {plan.period}
                  </p>
                </div>

                <div className="mt-6">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">
                    Included capabilities
                  </p>
                  <ul className="mt-4 space-y-3">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2.5 text-xs text-zinc-300 leading-relaxed sm:text-sm"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-4">
                <Button
                  size="lg"
                  onClick={() =>
                    router.push(plan.price === "Custom" ? "/contact" : "/login")
                  }
                  type="button"
                  className={cn(
                    "group h-11 w-full cursor-pointer rounded-full text-xs font-semibold transition-all sm:text-sm",
                    plan.highlight
                      ? "bg-white text-black shadow-[0_0_24px_rgba(255,255,255,0.16)] hover:bg-zinc-200"
                      : "border border-white/12 bg-white/[0.04] text-white hover:border-white/25 hover:bg-white/[0.08]"
                  )}
                >
                  <span>{plan.cta}</span>
                  <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Architectural Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          id="features"
          className="mt-20 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#09090c]"
        >
          <div className="border-b border-white/[0.07] px-6 py-5 sm:px-8">
            <h3 className="font-semibold text-lg text-white">
              Architecture &amp; Security Specification Matrix
            </h3>
            <p className="mt-1 text-xs text-zinc-400">
              Every plan runs on our zero-hallucination hybrid retrieval engine.
            </p>
          </div>

          <div className="divide-y divide-white/[0.06]">
            <div className="hidden grid-cols-12 bg-white/[0.02] px-8 py-3 font-mono text-[11px] uppercase tracking-wider text-zinc-400 sm:grid">
              <span className="col-span-6">Specification</span>
              <span className="col-span-2 text-center">Free</span>
              <span className="col-span-2 text-center text-white">Team</span>
              <span className="col-span-2 text-right">Enterprise</span>
            </div>

            {comparisonRows.map((row) => (
              <div
                key={row.feature}
                className="grid grid-cols-1 gap-2 px-6 py-4 text-xs sm:grid-cols-12 sm:items-center sm:px-8 sm:text-sm"
              >
                <span className="font-medium text-zinc-200 sm:col-span-6">
                  {row.feature}
                </span>
                <div className="flex items-center justify-between sm:col-span-2 sm:justify-center">
                  <span className="text-zinc-500 sm:hidden">Free:</span>
                  <span className="font-mono text-xs text-zinc-400">
                    {row.free}
                  </span>
                </div>
                <div className="flex items-center justify-between sm:col-span-2 sm:justify-center">
                  <span className="text-zinc-500 sm:hidden">Team:</span>
                  <span className="font-mono text-xs font-medium text-white">
                    {row.team}
                  </span>
                </div>
                <div className="flex items-center justify-between sm:col-span-2 sm:justify-end">
                  <span className="text-zinc-500 sm:hidden">Enterprise:</span>
                  <span className="font-mono text-xs text-emerald-400">
                    {row.enterprise}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
