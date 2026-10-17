"use client";

import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Database,
  FileText,
  Layers,
  MessageSquare,
  Plug,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

const coreIntegrations = [
  {
    name: "Salesforce",
    category: "CRM & Pipeline",
    logo: "/integrations/salesforce.png",
    description:
      "Bi-directional sync of opportunities, account notes, stage history, and custom deal fields.",
    syncMode: "Real-time webhook",
    status: "Live",
  },
  {
    name: "Gmail & Workspace",
    category: "Communication",
    logo: "/integrations/gmail.png",
    description:
      "Automatically indexes prospect threads, redline attachments, and stakeholder commitments.",
    syncMode: "Delta stream",
    status: "Live",
  },
  {
    name: "Slack",
    category: "Deal Rooms",
    logo: "/integrations/slack.png",
    description:
      "Query your knowledge vault directly from #deal-desk channels and capture internal decisions.",
    syncMode: "Event socket",
    status: "Live",
  },
  {
    name: "Zoho CRM",
    category: "CRM & Contacts",
    logo: "/integrations/zoho.png",
    description:
      "Enriches deal rooms with contact hierarchies, historical quotes, and territory playbooks.",
    syncMode: "Real-time webhook",
    status: "Live",
  },
];

const ecosystemTags = [
  { name: "Google Drive", category: "Cloud Storage", status: "Supported" },
  { name: "Notion", category: "Knowledge Wiki", status: "Supported" },
  { name: "HubSpot", category: "CRM Suite", status: "Supported" },
  { name: "Microsoft 365", category: "Enterprise Suite", status: "Supported" },
  { name: "SharePoint", category: "Document Repo", status: "Supported" },
  { name: "Zendesk", category: "Support Tickets", status: "Supported" },
  { name: "Linear", category: "Product Roadmap", status: "Supported" },
  { name: "Jira", category: "Engineering Specs", status: "Supported" },
];

const inputSignals = [
  {
    label: "Salesforce & Zoho CRM",
    sub: "Opportunities & Notes",
    icon: Database,
  },
  { label: "Playbooks, MSAs & XLSX", sub: "Tables & Clauses", icon: FileText },
  {
    label: "Gmail & Slack Threads",
    sub: "Live Deal Context",
    icon: MessageSquare,
  },
];

const outputActions = [
  {
    label: "100% Cited Deal Answers",
    sub: "Exact page & § clause links",
    icon: ShieldCheck,
  },
  {
    label: "Pre-Call Deal Briefings",
    sub: "1-click executive dossiers",
    icon: Calendar,
  },
  {
    label: "Competitive Rebuttals",
    sub: "Live objection battlecards",
    icon: TrendingUp,
  },
];

function AnimatedConduitBeam({ delay = 0 }: { delay?: number }) {
  return (
    <div className="relative flex h-6 w-full items-center justify-center overflow-hidden">
      <div className="h-px w-full bg-white/[0.08]" />
      <motion.div
        animate={{ left: ["-20%", "110%"] }}
        className="absolute h-1.5 w-12 rounded-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
        transition={{
          duration: 2.2,
          delay,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

export default function Integration() {
  return (
    <section className="relative w-full overflow-hidden bg-[#050507] px-4 py-24 sm:px-6 md:py-32 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section Header — Centered alignment, solid white H2 */}
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[11px] text-zinc-400 uppercase tracking-wider">
            <Plug className="h-3 w-3 text-zinc-300" />
            <span>Unified Ecosystem · 120+ Connectors</span>
          </div>
          <h2 className="font-semibold text-3xl text-white tracking-[-0.025em] sm:text-4xl md:text-5xl">
            Every revenue signal, indexed in one place.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-zinc-400 leading-relaxed sm:text-base">
            Connect your existing CRM, cloud storage, and messaging tools in
            under two minutes via OAuth 2.0. Zero custom ETL pipelines.
          </p>
          <div className="mt-5">
            <Link
              className="group inline-flex items-center gap-1.5 font-medium text-white text-xs transition-colors hover:text-zinc-300"
              href="/integration"
            >
              <span>Browse all 120+ integrations</span>
              <ArrowUpRight className="group-hover:-translate-y-0.5 h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </motion.div>

        {/* ── Live Animated Data Flow Architecture Diagram ── */}
        <motion.div
          className="mt-12 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#09090c] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-8"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-white/[0.06] border-b pb-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="font-mono font-semibold text-white text-xs uppercase tracking-wider">
                Live Data Flow Topology
              </span>
            </div>
            <span className="font-mono text-[11px] text-zinc-400">
              Raw Stack Signals ──► Hybrid RAG Engine ──► Grounded Deal Output
            </span>
          </div>

          <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-11">
            {/* Left: Input Signals (3 Cols) */}
            <div className="space-y-2.5 lg:col-span-3">
              <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
                01 · Connected Inputs
              </p>
              {inputSignals.map((sig, i) => {
                const Icon = sig.icon;
                return (
                  <motion.div
                    className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-[#060608] p-3"
                    initial={{ opacity: 0, x: -12 }}
                    key={sig.label}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                    whileInView={{ opacity: 1, x: 0 }}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
                      <Icon className="h-4 w-4 text-zinc-300" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-white text-xs">
                        {sig.label}
                      </p>
                      <p className="truncate text-[10px] text-zinc-500">
                        {sig.sub}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Animated Conduit Left -> Center (1 Col) */}
            <div className="hidden flex-col justify-center space-y-6 lg:col-span-1 lg:flex">
              <AnimatedConduitBeam delay={0} />
              <AnimatedConduitBeam delay={0.4} />
              <AnimatedConduitBeam delay={0.8} />
            </div>

            {/* Center: Salesient Hybrid RAG Core (3 Cols) */}
            <div className="relative flex flex-col items-center justify-center rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/[0.08] to-[#060608] p-6 text-center shadow-[0_0_40px_rgba(16,185,129,0.08)] lg:col-span-3">
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 0 0px rgba(52,211,153,0.25)",
                    "0 0 0 12px rgba(52,211,153,0)",
                  ],
                }}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/40 bg-emerald-500/15 text-emerald-300"
                transition={{
                  duration: 2.4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeOut",
                }}
              >
                <Layers className="h-5 w-5" />
              </motion.div>

              <span className="mt-3 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] text-emerald-400">
                Salesient RAG Core
              </span>
              <h3 className="mt-2 font-semibold text-base text-white">
                Hybrid Vector + BM25 Index
              </h3>
              <p className="mt-1 text-[11px] text-zinc-400 leading-relaxed">
                Parses tables, enforces workspace ACLs, and ranks exact clauses
                in &lt;190ms.
              </p>

              <div className="mt-4 grid w-full grid-cols-2 gap-2 border-white/[0.08] border-t pt-3 font-mono text-[10px]">
                <div className="rounded bg-black/40 py-1 text-zinc-300">
                  1,536-dim
                </div>
                <div className="rounded bg-black/40 py-1 text-emerald-400">
                  0 Hallucinations
                </div>
              </div>
            </div>

            {/* Animated Conduit Center -> Right (1 Col) */}
            <div className="hidden flex-col justify-center space-y-6 lg:col-span-1 lg:flex">
              <AnimatedConduitBeam delay={0.3} />
              <AnimatedConduitBeam delay={0.7} />
              <AnimatedConduitBeam delay={1.1} />
            </div>

            {/* Right: Grounded Outputs (3 Cols) */}
            <div className="space-y-2.5 lg:col-span-3">
              <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
                02 · Verified Outputs
              </p>
              {outputActions.map((act, i) => (
                <motion.div
                  className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-[#060608] p-3"
                  initial={{ opacity: 0, x: 12 }}
                  key={act.label}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  viewport={{ once: true }}
                  whileInView={{ opacity: 1, x: 0 }}
                >
                  <span className="h-6 w-px shrink-0 bg-emerald-400/50" />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-white text-xs">
                      {act.label}
                    </p>
                    <p className="truncate text-[10px] text-zinc-500">
                      {act.sub}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Core Connectors Grid */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {coreIntegrations.map((item, idx) => (
            <motion.div
              className="group hover:-translate-y-0.5 flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#09090c] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-300 hover:border-white/16"
              initial={{ opacity: 0, x: idx < 2 ? -28 : 28 }}
              key={item.name}
              transition={{
                duration: 0.5,
                delay: idx * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              viewport={{ once: true, margin: "-40px" }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] p-2.5">
                    {/** biome-ignore lint/performance/noImgElement: integration logo */}
                    {/** biome-ignore lint/correctness/useImageSize: CSS sized */}
                    <img
                      alt={item.name}
                      className="h-full w-full object-contain"
                      src={item.logo}
                    />
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 font-medium font-mono text-[10px] text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {item.status}
                  </span>
                </div>

                <div className="mt-5">
                  <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
                    {item.category}
                  </span>
                  <h3 className="mt-1 font-semibold text-lg text-white">
                    {item.name}
                  </h3>
                  <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-white/[0.06] border-t pt-3.5 font-mono text-[11px] text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="h-3 w-3 text-zinc-400" />
                  {item.syncMode}
                </span>
                <span className="text-zinc-400">OAuth 2.0</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Architectural Sync Strip + Extended Directory */}
        <motion.div
          className="mt-6 rounded-2xl border border-white/[0.08] bg-[#09090c] p-6 sm:p-8"
          initial={{ opacity: 0, y: 18 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-md">
              <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400 uppercase tracking-wider">
                <Zap className="h-3.5 w-3.5 text-emerald-400" />
                <span>Continuous Context Sync</span>
              </div>
              <h3 className="mt-2 font-semibold text-white text-xl">
                Plus 120+ enterprise tools ready out of the box
              </h3>
              <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed sm:text-sm">
                Permissions and ACLs are inherited from your source systems so
                reps only retrieve documents they are authorized to view.
              </p>
            </div>

            <div className="grid flex-1 grid-cols-2 gap-2.5 sm:grid-cols-4">
              {ecosystemTags.map((tool) => (
                <Link
                  className="group flex flex-col justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-3 transition-colors hover:border-white/15 hover:bg-white/[0.04]"
                  href="/integration"
                  key={tool.name}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-xs text-zinc-200 group-hover:text-white">
                      {tool.name}
                    </span>
                    <ArrowRight className="h-3 w-3 text-zinc-600 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-300" />
                  </div>
                  <span className="mt-1 text-[10px] text-zinc-500">
                    {tool.category}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
