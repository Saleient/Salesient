"use client";

import {
  ArrowRight,
  Check,
  Clock,
  CreditCard,
  Layers,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BillingCycle = "monthly" | "annual";

const comparisonRows = [
  {
    feature: "Hybrid Vector + BM25 Lexical Search",
    free: "Included",
    pro: "Included",
    enterprise: "Dedicated Cluster",
  },
  {
    feature: "Deterministic Page & Clause Citations",
    free: "100% Attributed",
    pro: "100% Attributed",
    enterprise: "100% Attributed",
  },
  {
    feature: "Connected Apps (Salesforce, Zoho, Slack, Drive)",
    free: "1 Connector",
    pro: "Up to 5 Connectors",
    enterprise: "Unlimited + Custom",
  },
  {
    feature: "Indexed Document Capacity",
    free: "100 docs / mo",
    pro: "5,000 docs / mo",
    enterprise: "Unlimited",
  },
  {
    feature: "Zero Model Training (ZDR Endpoints)",
    free: "Enforced",
    pro: "Enforced",
    enterprise: "Enforced + Custom KMS",
  },
  {
    feature: "Refund & Cancellation Policy",
    free: "Always Free",
    pro: "14-Day 100% Refund",
    enterprise: "Custom MSA Terms",
  },
];

const refundPolicyPoints = [
  {
    icon: RefreshCcw,
    title: "14-Day 100% Money-Back Guarantee",
    description:
      "Every new Pro subscription includes a 14-day full refund window. If Salesient doesn't fit your team's workflow, request a 100% refund within 14 calendar days—no questions asked.",
  },
  {
    icon: CreditCard,
    title: "Cancel Anytime · Zero Penalties",
    description:
      "No lock-in contracts or cancellation fees. Cancel or adjust seats anytime, and annual plans receive prorated refunds for unused full billing months.",
  },
  {
    icon: Clock,
    title: "Fast 3–5 Day Refund Settlement",
    description:
      "Submit a request via our Contact page or billing@salesient.com. Refunds are approved within 24 hours and credited back to your original payment method in 3–5 business days.",
  },
];

export default function Pricing() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

  const plans = [
    {
      id: "free",
      title: "Free",
      badge: "Starter",
      tagline: "For individual reps & early evaluation",
      price: "$0",
      period: "per month · forever free",
      cta: "Start Free Workspace",
      href: "/login",
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
      id: "pro",
      title: "Pro",
      badge: "Most Popular",
      tagline: "For high-velocity revenue teams up to 10 seats",
      price: billingCycle === "annual" ? "$15" : "$19",
      period:
        billingCycle === "annual"
          ? "per month billed annually ($180/yr), then +$12 / user / mo"
          : "per month base, then +$15 / user / mo",
      cta: "Buy Pro Plan",
      href: `/contact?plan=pro&billing=${billingCycle}`,
      highlight: true,
      features: [
        "Up to 5 concurrent CRM & cloud integrations",
        "Unlimited hybrid RAG search across shared vaults",
        "Auto-synced Deal Rooms & Competitive Battlecards",
        "Pre-call executive briefing generator",
        "Unlimited audit & citation history + priority support",
        "Protected by our 14-day 100% money-back refund policy",
      ],
    },
    {
      id: "enterprise",
      title: "Enterprise",
      badge: "Custom Scale",
      tagline: "For security-driven organizations at scale",
      price: "Custom",
      period: "Annual commitment · volume seat tiers",
      cta: "Contact Sales",
      href: "/contact?plan=enterprise",
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050507] px-4 pt-32 pb-20 text-white sm:px-6 md:pt-40 md:pb-28 lg:px-8">
      {/* Subtle Architectural Grid & Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grid-subtle [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000_25%,transparent_100%)]"
      />
      <div
        aria-hidden="true"
        className="-top-40 -translate-x-1/2 pointer-events-none absolute left-1/2 h-96 w-[780px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06)_0%,transparent_70%)] blur-2xl"
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 font-mono text-[11px] text-zinc-400 uppercase tracking-wider"
            initial={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.4 }}
          >
            <Layers className="h-3.5 w-3.5 text-zinc-300" />
            <span>Predictable Licensing</span>
          </motion.div>

          <motion.h1
            animate={{ opacity: 1, y: 0 }}
            className="text-balance font-semibold text-4xl text-white tracking-[-0.03em] sm:text-5xl md:text-6xl"
            initial={{ opacity: 0, y: 14 }}
            transition={{ duration: 0.5, delay: 0.06 }}
          >
            Transparent pricing for{" "}
            <span className="text-zinc-500">revenue velocity.</span>
          </motion.h1>

          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto mt-4 max-w-xl text-sm text-zinc-400 leading-relaxed sm:text-base"
            initial={{ opacity: 0, y: 14 }}
            transition={{ duration: 0.5, delay: 0.12 }}
          >
            Start indexing your playbooks and contracts for free. Upgrade to Pro
            when your team is ready for shared Deal Rooms and multi-CRM sync.
          </motion.p>

          {/* Simple Monthly / Annual Billing Toggle */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 inline-flex items-center gap-1 rounded-full border border-white/10 bg-[#09090c] p-1"
            initial={{ opacity: 0, y: 14 }}
            transition={{ duration: 0.5, delay: 0.16 }}
          >
            <button
              className={cn(
                "cursor-pointer rounded-full px-4 py-1.5 font-medium text-xs transition-all",
                billingCycle === "monthly"
                  ? "bg-white text-black"
                  : "text-zinc-400 hover:text-white"
              )}
              onClick={() => setBillingCycle("monthly")}
              type="button"
            >
              Monthly
            </button>
            <button
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-full px-4 py-1.5 font-medium text-xs transition-all",
                billingCycle === "annual"
                  ? "bg-white text-black"
                  : "text-zinc-400 hover:text-white"
              )}
              onClick={() => setBillingCycle("annual")}
              type="button"
            >
              <span>Annual</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 font-mono text-[10px] uppercase",
                  billingCycle === "annual"
                    ? "bg-emerald-500/20 text-emerald-950"
                    : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                )}
              >
                Save 20%
              </span>
            </button>
          </motion.div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {plans.map((plan, idx) => (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "relative flex flex-col justify-between rounded-2xl border p-7 sm:p-8",
                plan.highlight
                  ? "border-white/25 bg-gradient-to-b from-white/[0.07] to-[#09090c] shadow-[0_24px_60px_-15px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.2)]"
                  : "border-white/[0.08] bg-[#09090c] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
              )}
              initial={{ opacity: 0, y: 22 }}
              key={plan.id}
              transition={{
                duration: 0.5,
                delay: 0.15 + idx * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-white text-xl">
                    {plan.title}
                  </h2>
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-0.5 font-medium font-mono text-[10px] uppercase tracking-wider",
                      plan.highlight
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : "border-white/10 bg-white/[0.03] text-zinc-400"
                    )}
                  >
                    {plan.badge}
                  </span>
                </div>

                <p className="mt-2 text-xs text-zinc-400">{plan.tagline}</p>

                <div className="mt-6 border-white/[0.07] border-y py-6">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-4xl text-white tracking-tight sm:text-5xl">
                      {plan.price}
                    </span>
                    {plan.id === "pro" && (
                      <span className="font-mono text-xs text-zinc-400">
                        / month
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 font-mono text-xs text-zinc-500">
                    {plan.period}
                  </p>
                </div>

                <div className="mt-6">
                  <p className="font-mono text-[11px] text-zinc-400 uppercase tracking-wider">
                    Included capabilities
                  </p>
                  <ul className="mt-4 space-y-3">
                    {plan.features.map((f) => (
                      <li
                        className="flex items-start gap-2.5 text-xs text-zinc-300 leading-relaxed sm:text-sm"
                        key={f}
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
                  className={cn(
                    "group h-11 w-full cursor-pointer rounded-full font-semibold text-xs transition-all sm:text-sm",
                    plan.highlight
                      ? "bg-white text-black shadow-[0_0_24px_rgba(255,255,255,0.16)] hover:bg-zinc-200"
                      : "border border-white/12 bg-white/[0.04] text-white hover:border-white/25 hover:bg-white/[0.08]"
                  )}
                  onClick={() => router.push(plan.href)}
                  size="lg"
                  type="button"
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
          className="mt-20 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#09090c]"
          id="features"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <div className="border-white/[0.07] border-b px-6 py-5 sm:px-8">
            <h3 className="font-semibold text-lg text-white">
              Architecture &amp; Security Specification Matrix
            </h3>
            <p className="mt-1 text-xs text-zinc-400">
              Every plan runs on our zero-hallucination hybrid retrieval engine.
            </p>
          </div>

          <div className="divide-y divide-white/[0.06]">
            <div className="hidden grid-cols-12 bg-white/[0.02] px-8 py-3 font-mono text-[11px] text-zinc-400 uppercase tracking-wider sm:grid">
              <span className="col-span-6">Specification</span>
              <span className="col-span-2 text-center">Free</span>
              <span className="col-span-2 text-center text-white">Pro</span>
              <span className="col-span-2 text-right">Enterprise</span>
            </div>

            {comparisonRows.map((row) => (
              <div
                className="grid grid-cols-1 gap-2 px-6 py-4 text-xs sm:grid-cols-12 sm:items-center sm:px-8 sm:text-sm"
                key={row.feature}
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
                  <span className="text-zinc-500 sm:hidden">Pro:</span>
                  <span className="font-medium font-mono text-white text-xs">
                    {row.pro}
                  </span>
                </div>
                <div className="flex items-center justify-between sm:col-span-2 sm:justify-end">
                  <span className="text-zinc-500 sm:hidden">Enterprise:</span>
                  <span className="font-mono text-emerald-400 text-xs">
                    {row.enterprise}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Simple, Self-Contained Refund & Cancellation Policy Section */}
        <motion.div
          className="mt-16 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#09090c] p-6 sm:p-8"
          id="refund-policy"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col justify-between gap-4 border-white/[0.07] border-b pb-6 sm:flex-row sm:items-center">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 font-mono text-[10px] text-emerald-400 uppercase tracking-wider">
                <ShieldCheck className="h-3 w-3" />
                <span>Refund &amp; Cancellation Policy</span>
              </div>
              <h3 className="font-semibold text-lg text-white sm:text-xl">
                14-Day 100% Money-Back Guarantee &amp; Risk-Free Billing
              </h3>
              <p className="mt-1 text-xs text-zinc-400">
                Simple, transparent terms with zero hidden fees or lock-in
                commitments.
              </p>
            </div>
            <Link href="/contact?plan=billing">
              <Button
                className="h-9 shrink-0 cursor-pointer rounded-full border-white/12 bg-white/[0.04] px-4 font-medium text-white text-xs hover:border-white/25 hover:bg-white/[0.08]"
                size="sm"
                variant="outline"
              >
                Contact Billing Support
              </Button>
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {refundPolicyPoints.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  className="rounded-xl border border-white/[0.06] bg-[#060608] p-5"
                  key={item.title}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-emerald-400">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h4 className="font-semibold text-sm text-white">
                      {item.title}
                    </h4>
                  </div>
                  <p className="mt-2.5 text-xs text-zinc-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
