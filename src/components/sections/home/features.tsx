"use client";

import {
  ArrowRight,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  Database,
  FileText,
  FolderGit2,
  Layers,
  Lock,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UploadCloud,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════
   DATA: 4-Step Interactive "How You Use Salesient" Walkthrough
   ═══════════════════════════════════════════════════════════════════ */
const usageSteps = [
  {
    id: 0,
    number: "01",
    label: "Connect & Upload",
    title: "Drop in sales collateral or connect your CRM in 1 click",
    description:
      "Upload PDFs, DOCX contracts, and XLSX rate cards—or authenticate Salesforce, Zoho, Google Drive, and Slack via OAuth 2.0. Salesient parses tables and hierarchy automatically.",
    metric: "Supports 120+ OAuth connectors & multi-file upload",
  },
  {
    id: 1,
    number: "02",
    label: "Scope Deal Rooms",
    title: "Organize files into isolated Project Workspaces",
    description:
      "Group account-specific proposals, security addendums, and call notes into dedicated Deal Rooms so every query stays scoped to the right customer context.",
    metric: "Per-project vector isolation & role-based ACLs",
  },
  {
    id: 2,
    number: "03",
    label: "Ask in Natural Language",
    title: "Query across documents and live CRM records simultaneously",
    description:
      "Ask complex commercial, legal, or technical questions in Chat. Our hybrid engine fuses 1,536-dim semantic vectors with exact BM25 keyword matching in under 190ms.",
    metric: "< 190ms hybrid dense + lexical retrieval",
  },
  {
    id: 3,
    number: "04",
    label: "Verify & Share",
    title: "Inspect exact page citations and copy to your prospect",
    description:
      "Every generated bullet point is locked to a verifiable document clause and page number. Click any citation to inspect the raw passage, then copy or export to your deal memo.",
    metric: "100% deterministic citations · Zero hallucinations",
  },
];

const pipelineStages = [
  {
    step: "01",
    tag: "Ingestion & Structure Parsing",
    title: "Structure-Aware Document & CRM Indexing",
    description:
      "Upload PDFs, MSAs, rate cards, and pitch decks or sync directly from Google Drive and Salesforce. Unlike naive chunkers that flatten spreadsheets, Salesient preserves nested pricing tables, schedules, and legal clause hierarchies.",
    metrics: [
      "PDF, DOCX, XLSX, CSV & OAuth 2.0",
      "Nested table & header preservation",
      "Real-time CRM delta webhooks",
    ],
    icon: Database,
    video: "/stage-ingestion.mp4",
    terminalTitle: "parser://structure-aware-chunker",
    previewItems: [
      {
        label: "Q4_Enterprise_Playbook.pdf",
        meta: "48 pages · 312 hierarchical clauses",
        badge: "Indexed ✓",
      },
      {
        label: "Global_Rate_Card_2025.xlsx",
        meta: "6 sheets · Tabular schema locked",
        badge: "Parsed ✓",
      },
      {
        label: "Salesforce_Opportunity_Sync",
        meta: "1,420 active deal records · Live webhook",
        badge: "Streaming",
      },
    ],
  },
  {
    step: "02",
    tag: "Vector Chunking & Indexing",
    title: "Semantic Chunking into a Hybrid Vector Index",
    description:
      "Documents are sliced along clause and table boundaries into consistent chunks, embedded as 1,536-dim vectors, and indexed beside BM25 keywords. Similar passages cluster together, so exact SKUs, section numbers, and intent all retrieve in under 190ms.",
    metrics: [
      "Clause-aware chunk boundaries",
      "1,536-dim dense embeddings + BM25",
      "< 190ms p95 retrieval latency",
    ],
    icon: Search,
    video: "/stage-chunking.mp4",
    terminalTitle: "indexer://vector-chunker",
    previewItems: [
      {
        label: "Clause-Aware Slicing",
        meta: "Tables & sections kept intact",
        badge: "312 chunks",
      },
      {
        label: "Dense + BM25 Index",
        meta: "Semantic intent & exact tokens",
        badge: "1,536-dim",
      },
      {
        label: "Cross-Encoder Rerank",
        meta: "Top 4 passages locked",
        badge: "168ms p95",
      },
    ],
  },
  {
    step: "03",
    tag: "Deterministic Synthesis",
    title: "100% Citation-Locked Deal Intelligence",
    description:
      "Strict RAG guardrails constrain generation exclusively to retrieved context. Every generated claim carries an interactive link to the exact source document, page number, and section—eliminating AI hallucinations.",
    metrics: [
      "Zero hallucination guardrail",
      "Interactive page & clause links",
      "SOC 2 Type II audit trail",
    ],
    icon: ShieldCheck,
    video: "/stage-citation.mp4",
    terminalTitle: "verifier://citation-guardrail",
    previewItems: [
      {
        label: "SLA Concession Cap: 14.5% Max",
        meta: "Playbook_2025.pdf · §3.2 (Page 14)",
        badge: "Verified ✓",
      },
      {
        label: "EU Data Residency: AWS Frankfurt",
        meta: "SOC2_Addendum.docx · §7.1 (Page 6)",
        badge: "Verified ✓",
      },
      {
        label: "Liability Super-Cap: 2x Annual ACV",
        meta: "Executed_MSA.pdf · §11.3 (Page 27)",
        badge: "Verified ✓",
      },
    ],
  },
];

const vaultProjects = [
  {
    id: "enterprise",
    name: "Enterprise Deal Desk",
    filesCount: 42,
    updated: "Synced 2m ago",
    files: [
      {
        name: "Enterprise_Pricing_Matrix_2025.xlsx",
        type: "XLSX",
        size: "1.4 MB",
        chunks: "184 table rows",
      },
      {
        name: "Master_Services_Agreement_Standard.pdf",
        type: "PDF",
        size: "3.8 MB",
        chunks: "290 clauses",
      },
      {
        name: "Security_Questionnaire_SIG_Full.docx",
        type: "DOCX",
        size: "2.1 MB",
        chunks: "410 controls",
      },
    ],
  },
  {
    id: "competitors",
    name: "Competitive Intelligence",
    filesCount: 28,
    updated: "Synced 14m ago",
    files: [
      {
        name: "Legacy_CRM_Displacement_Playbook.pdf",
        type: "PDF",
        size: "2.9 MB",
        chunks: "142 rebuttals",
      },
      {
        name: "Q4_Win_Loss_Field_Notes.docx",
        type: "DOCX",
        size: "940 KB",
        chunks: "88 interviews",
      },
      {
        name: "Feature_Parity_Benchmark_2025.csv",
        type: "CSV",
        size: "420 KB",
        chunks: "120 rows",
      },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════
   ANIMATED STAGE CANVASES FOR THE 4-STEP APPLICATION WALKTHROUGH
   ═══════════════════════════════════════════════════════════════════ */
function Step01ConnectCanvas() {
  const items = [
    {
      name: "Q4_Enterprise_Playbook.pdf",
      type: "PDF Upload",
      detail: "Parsing nested pricing tables & 48 pages",
      progress: 100,
      delay: 0.05,
    },
    {
      name: "Salesforce CRM · Opportunities",
      type: "OAuth 2.0 Stream",
      detail: "Syncing 1,420 active deal records & stage notes",
      progress: 100,
      delay: 0.18,
    },
    {
      name: "SOC2_Compliance_Addendum.docx",
      type: "DOCX Upload",
      detail: "Generating 1,536-dim dense vector chunks",
      progress: 100,
      delay: 0.3,
    },
  ];

  return (
    <div className="flex h-full flex-col justify-between space-y-4">
      <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
        <div className="flex items-center gap-2">
          <UploadCloud className="h-4 w-4 text-emerald-400" />
          <span className="font-medium text-xs text-white">
            Ingestion &amp; OAuth Pipeline
          </span>
        </div>
        <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] text-emerald-400">
          Live Indexing
        </span>
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: idx % 2 === 0 ? -18 : 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: item.delay }}
            className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white">{item.name}</span>
              <span className="rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-zinc-300">
                {item.type}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-zinc-400">{item.detail}</p>
            <div className="mt-2.5 flex items-center gap-2.5">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: `${item.progress}%` }}
                  transition={{
                    duration: 0.85,
                    delay: item.delay + 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="h-full rounded-full bg-gradient-to-r from-zinc-300 to-emerald-400"
                />
              </div>
              <span className="font-mono text-[10px] text-emerald-400">
                Ready ✓
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-black/40 px-3.5 py-2.5 font-mono text-[11px] text-zinc-400">
        <span>Schema &amp; Table Hierarchy: Preserved</span>
        <span className="text-emerald-400">3 / 3 Sources Indexed</span>
      </div>
    </div>
  );
}

function Step02ScopeRoomsCanvas() {
  const rooms = [
    {
      name: "Stripe Enterprise Expansion",
      tag: "Deal Room · $185k ACV",
      files: ["Playbook_2025.pdf", "SOC2_Addendum.docx", "Salesforce #4092"],
      active: true,
    },
    {
      name: "Global Competitive Battlecards",
      tag: "Shared Team Vault",
      files: ["Competitor_Matrix.xlsx", "Win_Loss_Q4.pdf"],
      active: false,
    },
  ];

  return (
    <div className="flex h-full flex-col justify-between space-y-4">
      <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
        <div className="flex items-center gap-2">
          <FolderGit2 className="h-4 w-4 text-emerald-400" />
          <span className="font-medium text-xs text-white">
            Project-Scoped Knowledge Vaults
          </span>
        </div>
        <span className="font-mono text-[10px] text-zinc-400">
          Namespace Isolated
        </span>
      </div>

      <div className="space-y-3">
        {rooms.map((room, idx) => (
          <motion.div
            key={room.name}
            initial={{ opacity: 0, x: idx === 0 ? -18 : 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.15 }}
            className={cn(
              "rounded-xl border p-4",
              room.active
                ? "border-emerald-500/35 bg-emerald-500/[0.05]"
                : "border-white/[0.07] bg-white/[0.02]"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-emerald-400" />
                <span className="font-semibold text-xs text-white sm:text-sm">
                  {room.name}
                </span>
              </div>
              <span className="rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-zinc-300">
                {room.tag}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {room.files.map((f, fIdx) => (
                <motion.span
                  key={f}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + fIdx * 0.08 }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#070709] px-2.5 py-1 font-mono text-[10px] text-zinc-300"
                >
                  <FileText className="h-3 w-3 text-emerald-400" />
                  {f}
                </motion.span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-black/40 px-3.5 py-2.5 font-mono text-[11px] text-zinc-400">
        <span>Zero cross-project data leakage</span>
        <span className="text-emerald-400">ACL Verified ✓</span>
      </div>
    </div>
  );
}

function Step03QueryCanvas() {
  const hits = [
    {
      clause: "Playbook §3.2 (p.14) — 14.5% multi-year SLA discount cap",
      score: 99.4,
    },
    {
      clause: "SOC2 Addendum §7.1 (p.6) — AWS Frankfurt EU data residency",
      score: 98.7,
    },
    {
      clause: "Salesforce Opp #4092 — Net-45 billing pre-approved for $185k",
      score: 95.2,
    },
  ];

  return (
    <div className="flex h-full flex-col justify-between space-y-4">
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        className="rounded-xl border border-white/15 bg-[#0a0a0e] p-3.5"
      >
        <div className="flex items-center justify-between font-mono text-[10px] text-zinc-500">
          <span>Active Scope: @Stripe_Enterprise_Expansion</span>
          <span className="text-emerald-400">164ms Latency</span>
        </div>
        <p className="mt-1.5 font-medium text-xs text-white sm:text-sm">
          “What is our maximum multi-year discount without VP approval, and how
          is EU customer data isolated?”
        </p>
      </motion.div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-zinc-400">
          <span>Hybrid Vector + Lexical Reranker</span>
          <span className="text-emerald-400">Top 3 Clauses Locked</span>
        </div>
        {hits.map((hit, idx) => (
          <motion.div
            key={hit.clause}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.12 + idx * 0.1 }}
            className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3"
          >
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="truncate font-medium text-zinc-200">
                {hit.clause}
              </span>
              <span className="shrink-0 font-mono text-[10px] font-semibold text-emerald-400">
                {hit.score}%
              </span>
            </div>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: `${hit.score}%` }}
                transition={{
                  duration: 0.7,
                  delay: 0.2 + idx * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="h-full rounded-full bg-emerald-400"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Step04VerifyShareCanvas() {
  return (
    <div className="flex h-full flex-col justify-between space-y-4">
      <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span className="font-medium text-xs text-white">
            Deterministic Citation &amp; Source Inspector
          </span>
        </div>
        <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] text-emerald-400">
          Verified Page 14
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 sm:col-span-6"
        >
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              AI Deal Response
            </span>
            <p className="mt-1.5 text-xs text-zinc-200 leading-relaxed">
              Account Executives may authorize up to a{" "}
              <strong className="text-white">14.5% discount</strong> on 2-year
              upfront commits. Concessions ≥15% require VP sign-off.
            </p>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-2.5">
            <span className="inline-flex items-center gap-1 rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] text-emerald-300">
              [Playbook §3.2 · p.14]
            </span>
            <span className="font-mono text-[10px] text-zinc-400">
              1-Click Copy
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.12 }}
          className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.04] p-3.5 sm:col-span-6"
        >
          <div className="flex items-center justify-between font-mono text-[10px] text-emerald-400">
            <span>Q4_Enterprise_Playbook.pdf</span>
            <span>Page 14</span>
          </div>
          <p className="mt-2 rounded-lg border border-emerald-500/20 bg-black/50 p-2.5 font-mono text-[11px] text-zinc-200 leading-relaxed">
            “3.2 Multi-Year Concessions: Reps may extend up to{" "}
            <span className="bg-emerald-500/25 px-1 text-emerald-200">
              14.5% discount
            </span>{" "}
            on 24-month upfront commitments without executive escalation…”
          </p>
        </motion.div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-black/40 px-3.5 py-2.5 font-mono text-[11px] text-zinc-400">
        <span>Every statement traced to exact paragraph</span>
        <span className="text-emerald-400">Ready for Prospect ✓</span>
      </div>
    </div>
  );
}

export default function Features() {
  const [activeWalkthrough, setActiveWalkthrough] = useState(0);
  const [walkthroughPaused, setWalkthroughPaused] = useState(false);
  const [selectedVault, setSelectedVault] = useState(0);
  const [selectedClause, setSelectedClause] = useState(0);

  useEffect(() => {
    if (walkthroughPaused) return;
    const timer = setInterval(() => {
      setActiveWalkthrough((prev) => (prev + 1) % usageSteps.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [walkthroughPaused]);

  const clauses = [
    {
      claim: "Standard multi-year discount is capped at 14.5% of list ACV.",
      doc: "Q4_Enterprise_Playbook.pdf",
      section: "Section 3.2 · Commercial Approval Matrix",
      page: "Page 14",
      raw: "“3.2 Multi-Year Commitment Concessions: Account Executives may extend up to a 14.5% discount on 24-month or 36-month upfront commitments. Any concession ≥15.0% requires written VP of Revenue sign-off in Salesforce.”",
    },
    {
      claim: "Customer data is never used to train foundation models.",
      doc: "SOC2_Compliance_Addendum.docx",
      section: "Section 5.4 · AI Sub-processor & Zero-Retention Policy",
      page: "Page 9",
      raw: "“5.4 Zero Training Guarantee: Customer Inputs and Indexed Embeddings are processed strictly via zero-data-retention (ZDR) enterprise endpoints and shall never be used to train or fine-tune third-party models.”",
    },
  ];

  return (
    <section
      id="features"
      className="relative w-full overflow-hidden bg-[#050507] px-4 py-24 sm:px-6 md:py-32 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        {/* ═══════════════════════════════════════════════════════════════
            PART 0: INTERACTIVE "HOW YOU USE SALESIENT" SPLIT WALKTHROUGH
           ═══════════════════════════════════════════════════════════════ */}
        <div className="mb-28 md:mb-36">
          <div className="flex flex-col items-start justify-between gap-6 border-b border-white/[0.07] pb-10 md:flex-row md:items-end">
            <motion.div
              initial={{ opacity: 0, x: -32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.08] px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-emerald-400">
                <Play className="h-3 w-3 fill-emerald-400" />
                <span>Interactive Product Walkthrough</span>
              </div>
              <h2 className="max-w-2xl font-semibold text-3xl tracking-[-0.025em] text-white sm:text-4xl md:text-5xl">
                How your team uses Salesient{" "}
                <span className="text-zinc-500">in four steps.</span>
              </h2>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, x: 32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-md text-sm text-zinc-400 leading-relaxed sm:text-base"
            >
              Select any stage on the left—or watch the live sequence—to see how
              raw documents and CRM records become verified deal answers on the
              right.
            </motion.p>
          </div>

          <div
            onMouseEnter={() => setWalkthroughPaused(true)}
            onMouseLeave={() => setWalkthroughPaused(false)}
            className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12"
          >
            {/* Left Column: Slides in from Left */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col justify-between gap-3 lg:col-span-5"
            >
              {usageSteps.map((s, idx) => {
                const isSelected = activeWalkthrough === idx;
                return (
                  <button
                    key={s.number}
                    type="button"
                    onClick={() => setActiveWalkthrough(idx)}
                    className={cn(
                      "group relative w-full cursor-pointer overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300",
                      isSelected
                        ? "border-white/20 bg-[#0c0c10] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                        : "border-white/[0.07] bg-[#08080b] hover:border-white/15"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={cn(
                            "flex h-6 w-6 items-center justify-center rounded-md font-mono text-xs font-semibold transition-colors",
                            isSelected
                              ? "border border-emerald-500/30 bg-emerald-500/20 text-emerald-300"
                              : "bg-white/[0.04] text-zinc-400"
                          )}
                        >
                          {s.number}
                        </span>
                        <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">
                          {s.label}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="font-mono text-[10px] text-emerald-400">
                          Active Step
                        </span>
                      )}
                    </div>

                    <h3 className="mt-2.5 font-semibold text-sm text-white sm:text-base">
                      {s.title}
                    </h3>

                    {isSelected && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-2 text-xs text-zinc-400 leading-relaxed"
                      >
                        {s.description}
                      </motion.p>
                    )}

                    {isSelected && !walkthroughPaused && (
                      <motion.span
                        key={`walk-progress-${activeWalkthrough}`}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 5.5, ease: "linear" }}
                        className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-emerald-400"
                      />
                    )}
                  </button>
                );
              })}
            </motion.div>

            {/* Right Column: Slides in from Right */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.6,
                delay: 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.1] bg-[#09090c] p-6 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-8 lg:col-span-7"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeWalkthrough}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full"
                >
                  {activeWalkthrough === 0 && <Step01ConnectCanvas />}
                  {activeWalkthrough === 1 && <Step02ScopeRoomsCanvas />}
                  {activeWalkthrough === 2 && <Step03QueryCanvas />}
                  {activeWalkthrough === 3 && <Step04VerifyShareCanvas />}
                </motion.div>
              </AnimatePresence>

              <div className="mt-6 flex items-center justify-between border-t border-white/[0.07] pt-4 text-xs text-zinc-400">
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>{usageSteps[activeWalkthrough].metric}</span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setActiveWalkthrough(
                      (prev) => (prev + 1) % usageSteps.length
                    )
                  }
                  className="inline-flex cursor-pointer items-center gap-1 font-mono text-[11px] text-white hover:text-emerald-400"
                >
                  <span>Next Step</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            PART 1: ALTERNATING LEFT-RIGHT ZIG-ZAG RAG ARCHITECTURE
           ═══════════════════════════════════════════════════════════════ */}
        <div>
          <div className="flex flex-col items-start justify-between gap-6 border-b border-white/[0.07] pb-12 md:flex-row md:items-end">
            <motion.div
              initial={{ opacity: 0, x: -32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
            >
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-zinc-400">
                <Layers className="h-3 w-3 text-zinc-300" />
                <span>Under the Hood · RAG Architecture</span>
              </div>
              <h2 className="max-w-2xl font-semibold text-3xl tracking-[-0.025em] text-white sm:text-4xl md:text-5xl">
                How Salesient turns raw files into{" "}
                <span className="text-zinc-500">verifiable deal truth.</span>
              </h2>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, x: 32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              className="max-w-md text-sm text-zinc-400 leading-relaxed sm:text-base"
            >
              Generic AI wrappers hallucinate pricing and contract terms. Our
              three-stage RAG pipeline is purpose-built for precision revenue
              workflows.
            </motion.p>
          </div>

          {/* Alternating Left-Right Rows */}
          <div className="mt-14 space-y-12 md:space-y-20">
            {pipelineStages.map((stage, idx) => {
              const Icon = stage.icon;
              const isReversed = idx % 2 === 1;
              return (
                <div
                  key={stage.step}
                  className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12"
                >
                  {/* Narrative Column (Alternates Left / Right) */}
                  <motion.div
                    initial={{ opacity: 0, x: isReversed ? 44 : -44 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className={cn(
                      "flex flex-col items-start lg:col-span-5",
                      isReversed ? "lg:order-2" : "lg:order-1"
                    )}
                  >
                    <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">
                      <span className="font-mono text-xs font-semibold text-emerald-400">
                        STAGE {stage.step}
                      </span>
                      <span className="h-3 w-px bg-white/15" />
                      <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">
                        {stage.tag}
                      </span>
                    </div>

                    <h3 className="mt-5 font-semibold text-2xl tracking-tight text-white sm:text-3xl">
                      {stage.title}
                    </h3>
                    <p className="mt-3 text-sm text-zinc-400 leading-relaxed sm:text-base">
                      {stage.description}
                    </p>

                    <div className="mt-6 flex flex-wrap gap-2.5">
                      {stage.metrics.map((m) => (
                        <span
                          key={m}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-[#09090c] px-3 py-1.5 text-xs text-zinc-300"
                        >
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          {m}
                        </span>
                      ))}
                    </div>
                  </motion.div>

                  {/* Visual Schematic Card Column (Alternates Right / Left) */}
                  <motion.div
                    initial={{ opacity: 0, x: isReversed ? -44 : 44 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{
                      duration: 0.6,
                      delay: 0.08,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className={cn(
                      "lg:col-span-7",
                      isReversed ? "lg:order-1" : "lg:order-2"
                    )}
                  >
                    <div className="overflow-hidden rounded-2xl border border-white/[0.1] bg-[#09090c] p-1.5 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.08)]">
                      <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-[#050507]">
                        {/* Window Chrome */}
                        <div className="flex items-center justify-between border-b border-white/[0.07] bg-[#0b0b10] px-4 py-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-6 w-6 items-center justify-center rounded-md border border-emerald-500/30 bg-emerald-500/15 text-emerald-400">
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            <span className="font-mono text-[11px] text-zinc-300">
                              {stage.terminalTitle}
                            </span>
                          </div>
                          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] text-emerald-400">
                            Stage {stage.step}
                          </span>
                        </div>

                        {/* Stage Video */}
                        <div className="relative aspect-video w-full overflow-hidden bg-black">
                          <video
                            src={stage.video}
                            autoPlay
                            loop
                            muted
                            playsInline
                            preload="metadata"
                            className="h-full w-full object-cover"
                          />
                          <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 shadow-[inset_0_0_36px_rgba(5,5,7,0.65)]"
                          />
                        </div>

                        {/* Compact Detail Strip */}
                        <div className="grid grid-cols-1 divide-y divide-white/[0.06] border-t border-white/[0.07] bg-[#08080c] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                          {stage.previewItems.map((item, itemIdx) => (
                            <motion.div
                              key={item.label}
                              initial={{ opacity: 0, x: isReversed ? -12 : 12 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{
                                duration: 0.4,
                                delay: 0.15 + itemIdx * 0.08,
                              }}
                              className="min-w-0 px-4 py-3"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <p className="truncate font-semibold text-[11px] text-white">
                                  {item.label}
                                </p>
                                <span className="shrink-0 font-mono text-[10px] text-emerald-400">
                                  {item.badge}
                                </span>
                              </div>
                              <p className="mt-0.5 truncate text-[10px] text-zinc-500">
                                {item.meta}
                              </p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            PART 2: PRECISION BENTO GRID — LEFT/RIGHT MOTION CHOREOGRAPHY
           ═══════════════════════════════════════════════════════════════ */}
        <div className="mt-28 md:mt-36">
          <div className="flex flex-col items-start justify-between gap-6 border-b border-white/[0.07] pb-12 md:flex-row md:items-end">
            <motion.div
              initial={{ opacity: 0, x: -32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
            >
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-zinc-400">
                <Sparkles className="h-3 w-3 text-zinc-300" />
                <span>Core Capabilities</span>
              </div>
              <h2 className="max-w-2xl font-semibold text-3xl tracking-[-0.025em] text-white sm:text-4xl md:text-5xl">
                Designed for high-velocity{" "}
                <span className="text-zinc-500">revenue teams.</span>
              </h2>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, x: 32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              className="max-w-md text-sm text-zinc-400 leading-relaxed sm:text-base"
            >
              Everything your account executives, solutions engineers, and deal
              desk need to close complex enterprise deals faster.
            </motion.p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Bento Card 1 (7 Cols, Slides from Left) */}
            <motion.div
              initial={{ opacity: 0, x: -36 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-[#09090c] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-8 lg:col-span-7"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[11px] text-zinc-300">
                    <FolderGit2 className="h-3.5 w-3.5 text-zinc-400" />
                    01 · Knowledge Workspaces
                  </span>
                  <span className="font-mono text-xs text-zinc-500">
                    Multi-project isolation
                  </span>
                </div>

                <h3 className="mt-5 font-semibold text-2xl tracking-tight text-white">
                  Project-Scoped Document Vaults
                </h3>
                <p className="mt-2 max-w-xl text-sm text-zinc-400 leading-relaxed">
                  Organize playbooks, security addendums, and spreadsheets into
                  dedicated deal rooms or team repositories. Click a workspace
                  below to inspect its indexed files.
                </p>
              </div>

              <div className="mt-7 rounded-xl border border-white/[0.07] bg-[#060608] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
                  <div className="flex items-center gap-1.5">
                    {vaultProjects.map((proj, i) => (
                      <button
                        key={proj.id}
                        type="button"
                        onClick={() => setSelectedVault(i)}
                        className={cn(
                          "cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                          selectedVault === i
                            ? "border border-white/15 bg-white/[0.08] text-white"
                            : "text-zinc-400 hover:text-zinc-200"
                        )}
                      >
                        {proj.name}
                      </button>
                    ))}
                  </div>
                  <span className="font-mono text-[11px] text-emerald-400">
                    ● {vaultProjects[selectedVault].updated}
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={vaultProjects[selectedVault].id}
                    initial={{ opacity: 0, x: 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -14 }}
                    transition={{ duration: 0.22 }}
                    className="mt-3 space-y-2"
                  >
                    {vaultProjects[selectedVault].files.map((file) => (
                      <div
                        key={file.name}
                        className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2.5 transition-colors hover:border-white/10"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-7 w-10 shrink-0 items-center justify-center rounded border border-white/10 bg-white/[0.04] font-mono text-[10px] font-semibold text-zinc-300">
                            {file.type}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-xs text-zinc-200">
                              {file.name}
                            </p>
                            <p className="text-[11px] text-zinc-500">
                              {file.size} &middot; {file.chunks}
                            </p>
                          </div>
                        </div>
                        <span className="shrink-0 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                          Ready
                        </span>
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Bento Card 2 (5 Cols, Slides from Right) */}
            <motion.div
              initial={{ opacity: 0, x: 36 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.55,
                delay: 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-[#09090c] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-8 lg:col-span-5"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[11px] text-zinc-300">
                    <TrendingUp className="h-3.5 w-3.5 text-zinc-400" />
                    02 · Battlecards
                  </span>
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] text-emerald-400">
                    +18% Win Rate
                  </span>
                </div>

                <h3 className="mt-5 font-semibold text-2xl tracking-tight text-white">
                  Live Competitive Intelligence
                </h3>
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                  Surface structured objection rebuttals, pricing comparisons,
                  and verified win/loss notes during live prospect calls.
                </p>
              </div>

              <div className="mt-7 rounded-xl border border-white/[0.07] bg-[#060608] p-4">
                <div className="mb-3 flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="font-mono uppercase tracking-wider">
                    Capability Benchmark
                  </span>
                  <span className="font-mono text-zinc-500">
                    Verified Q4 Audit
                  </span>
                </div>

                <div className="space-y-2">
                  {[
                    {
                      capability: "Table & Clause Accuracy",
                      us: "99.1%",
                      them: "71.4%",
                    },
                    {
                      capability: "Query Retrieval Latency",
                      us: "168ms",
                      them: "2,400ms",
                    },
                    {
                      capability: "Page-Level Citations",
                      us: "Deterministic",
                      them: "Unverified",
                    },
                  ].map((row) => (
                    <div
                      key={row.capability}
                      className="grid grid-cols-12 items-center gap-2 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-xs"
                    >
                      <span className="col-span-6 truncate text-zinc-300">
                        {row.capability}
                      </span>
                      <span className="col-span-3 rounded border border-emerald-500/20 bg-emerald-500/10 py-0.5 text-center font-mono text-[11px] font-medium text-emerald-400">
                        {row.us}
                      </span>
                      <span className="col-span-3 text-right font-mono text-[11px] text-zinc-500">
                        {row.them}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Bento Card 3 (5 Cols, Slides from Left) */}
            <motion.div
              initial={{ opacity: 0, x: -36 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.55,
                delay: 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-[#09090c] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-8 lg:col-span-5"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[11px] text-zinc-300">
                    <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                    03 · Deal Prep
                  </span>
                  <span className="font-mono text-xs text-zinc-500">
                    1-Click Briefs
                  </span>
                </div>

                <h3 className="mt-5 font-semibold text-2xl tracking-tight text-white">
                  Automated Meeting Briefings
                </h3>
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                  Walk into every renewal or discovery call with an automated
                  dossier combining CRM history, email threads, and contract
                  terms.
                </p>
              </div>

              <div className="mt-7 rounded-xl border border-white/[0.07] bg-[#060608] p-4">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <div>
                    <p className="font-medium text-xs text-white">
                      Acme Global · Executive QBR
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      Synthesized from Salesforce, Gmail &amp; MSA
                    </p>
                  </div>
                  <span className="rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-zinc-300">
                    Today · 14:00
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  {[
                    "Renewal target: $140k ACV (+25 seats expansion)",
                    "Open legal item: Section 11.3 cap pre-approved",
                    "Champion priority: Native Slack & Drive sync",
                  ].map((pt) => (
                    <div
                      key={pt}
                      className="flex items-center gap-2.5 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-xs text-zinc-300"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                      <span className="truncate">{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Bento Card 4 (7 Cols, Slides from Right) */}
            <motion.div
              initial={{ opacity: 0, x: 36 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.55,
                delay: 0.14,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-[#09090c] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-8 lg:col-span-7"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[11px] text-zinc-300">
                    <BookOpen className="h-3.5 w-3.5 text-zinc-400" />
                    04 · Verifiable Audit Trail
                  </span>
                  <span className="font-mono text-xs text-emerald-400">
                    Zero Hallucinations
                  </span>
                </div>

                <h3 className="mt-5 font-semibold text-2xl tracking-tight text-white">
                  Interactive Clause-Level Verification
                </h3>
                <p className="mt-2 max-w-xl text-sm text-zinc-400 leading-relaxed">
                  Never second-guess an AI answer before sending it to a
                  prospect. Select any generated statement below to inspect the
                  exact underlying passage.
                </p>
              </div>

              <div className="mt-7 grid grid-cols-1 gap-3 rounded-xl border border-white/[0.07] bg-[#060608] p-4 sm:grid-cols-12">
                <div className="space-y-2 sm:col-span-5">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                    Generated Claims
                  </p>
                  {clauses.map((c, idx) => (
                    <button
                      key={c.claim}
                      type="button"
                      onClick={() => setSelectedClause(idx)}
                      className={cn(
                        "w-full cursor-pointer rounded-lg border p-2.5 text-left text-xs transition-all",
                        selectedClause === idx
                          ? "border-white/20 bg-white/[0.07] text-white"
                          : "border-white/[0.05] bg-white/[0.02] text-zinc-400 hover:text-zinc-200"
                      )}
                    >
                      <p className="line-clamp-2 font-medium leading-snug">
                        {c.claim}
                      </p>
                      <span className="mt-1.5 inline-block font-mono text-[10px] text-emerald-400">
                        [{c.page}] →
                      </span>
                    </button>
                  ))}
                </div>

                <div className="flex flex-col justify-between rounded-lg border border-white/[0.07] bg-[#0a0a0e] p-3.5 sm:col-span-7">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedClause}
                      initial={{ opacity: 0, x: 14 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -14 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                        <span className="flex items-center gap-1.5 font-medium text-xs text-white">
                          <FileText className="h-3.5 w-3.5 text-emerald-400" />
                          {clauses[selectedClause].doc}
                        </span>
                        <span className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-zinc-300">
                          {clauses[selectedClause].page}
                        </span>
                      </div>
                      <p className="mt-2 font-mono text-[10px] text-zinc-400">
                        {clauses[selectedClause].section}
                      </p>
                      <p className="mt-2 rounded border border-emerald-500/20 bg-emerald-500/[0.05] p-2.5 font-mono text-[11px] text-zinc-200 leading-relaxed">
                        {clauses[selectedClause].raw}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
