"use client";

import { Check, FileText, FolderOpen } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

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
    video: "/stage-ingestion.mp4",
    breadcrumbs: ["Workspace", "Knowledge Vault", "Q4_Enterprise_Playbook.pdf"],
    statusLabel: "Synced · 48 pages",
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
    video: "/stage-chunking.mp4",
    breadcrumbs: ["Workspace", "Deal Room", "Global_Rate_Card_2025.xlsx"],
    statusLabel: "312 chunks indexed",
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
    video: "/stage-citation.mp4",
    breadcrumbs: ["Workspace", "Deal Room", "Acme Corp MSA"],
    statusLabel: "Citations locked",
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

export default function Features() {
  return (
    <section
      className="relative w-full overflow-hidden bg-[#050507] px-4 py-24 sm:px-6 md:py-32 lg:px-8"
      id="features"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Header — Left-aligned, no pill badge, solid white H2 */}
        <motion.div
          className="max-w-3xl border-white/[0.07] border-b pb-12"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.55 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <h2 className="font-semibold text-3xl text-white tracking-[-0.025em] sm:text-4xl md:text-5xl">
            How Salesient turns raw files into verifiable deal truth.
          </h2>
          <p className="mt-4 max-w-2xl text-sm text-zinc-400 leading-relaxed sm:text-base">
            Generic AI wrappers hallucinate pricing and contract terms. Our
            three-stage RAG pipeline preserves complex tables and locks every
            answer to its exact source page.
          </p>
        </motion.div>

        {/* Alternating Left-Right Rows */}
        <div className="mt-14 space-y-12 md:space-y-20">
          {pipelineStages.map((stage, idx) => {
            const isReversed = idx % 2 === 1;
            return (
              <div
                className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12"
                key={stage.step}
              >
                {/* Narrative Column (Alternates Left / Right) */}
                <motion.div
                  className={cn(
                    "flex flex-col items-start lg:col-span-5",
                    isReversed ? "lg:order-2" : "lg:order-1"
                  )}
                  initial={{ opacity: 0, x: isReversed ? 44 : -44 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true, margin: "-60px" }}
                  whileInView={{ opacity: 1, x: 0 }}
                >
                  <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">
                    <span className="font-mono font-semibold text-white text-xs">
                      STAGE {stage.step}
                    </span>
                    <span className="h-3 w-px bg-white/15" />
                    <span className="font-mono text-[11px] text-zinc-400 uppercase tracking-wider">
                      {stage.tag}
                    </span>
                  </div>

                  <h3 className="mt-5 font-semibold text-2xl text-white tracking-tight sm:text-3xl">
                    {stage.title}
                  </h3>
                  <p className="mt-3 text-sm text-zinc-400 leading-relaxed sm:text-base">
                    {stage.description}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2.5">
                    {stage.metrics.map((m) => (
                      <span
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-[#09090c] px-3 py-1.5 text-xs text-zinc-300"
                        key={m}
                      >
                        <Check className="h-3.5 w-3.5 text-white" />
                        {m}
                      </span>
                    ))}
                  </div>
                </motion.div>

                {/* Visual Video Card Column (Alternates Right / Left) */}
                <motion.div
                  className={cn(
                    "lg:col-span-7",
                    isReversed ? "lg:order-1" : "lg:order-2"
                  )}
                  initial={{ opacity: 0, x: isReversed ? -44 : 44 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  viewport={{ once: true, margin: "-60px" }}
                  whileInView={{ opacity: 1, x: 0 }}
                >
                  <div className="overflow-hidden rounded-2xl border border-white/[0.1] bg-[#09090c] p-1.5 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.08)]">
                    <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-[#050507]">
                      {/* Real Application Breadcrumb Chrome */}
                      <div className="flex items-center justify-between border-white/[0.07] border-b bg-[#0b0b10] px-4 py-2.5">
                        <nav
                          aria-label="App location"
                          className="flex min-w-0 items-center gap-1.5 text-[11px]"
                        >
                          <FolderOpen className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                          {stage.breadcrumbs.map((crumb, cIdx) => {
                            const isLast =
                              cIdx === stage.breadcrumbs.length - 1;
                            return (
                              <span
                                className="flex items-center gap-1.5 truncate"
                                key={crumb}
                              >
                                {cIdx > 0 && (
                                  <span className="text-zinc-700">/</span>
                                )}
                                <span
                                  className={cn(
                                    "truncate",
                                    isLast
                                      ? "font-medium text-zinc-200"
                                      : "hidden text-zinc-500 sm:inline"
                                  )}
                                >
                                  {crumb}
                                </span>
                              </span>
                            );
                          })}
                        </nav>
                        <span className="shrink-0 rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-zinc-300">
                          {stage.statusLabel}
                        </span>
                      </div>

                      {/* Stage Video */}
                      <div className="relative aspect-video w-full overflow-hidden bg-black">
                        <video
                          autoPlay
                          className="h-full w-full object-cover"
                          loop
                          muted
                          playsInline
                          preload="metadata"
                          src={stage.video}
                        />
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 shadow-[inset_0_0_36px_rgba(5,5,7,0.65)]"
                        />
                      </div>

                      {/* Compact Detail Strip */}
                      <div className="grid grid-cols-1 divide-y divide-white/[0.06] border-white/[0.07] border-t bg-[#08080c] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                        {stage.previewItems.map((item, itemIdx) => (
                          <motion.div
                            className="min-w-0 px-4 py-3"
                            initial={{ opacity: 0, x: isReversed ? -12 : 12 }}
                            key={item.label}
                            transition={{
                              duration: 0.4,
                              delay: 0.15 + itemIdx * 0.08,
                            }}
                            viewport={{ once: true }}
                            whileInView={{ opacity: 1, x: 0 }}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate font-semibold text-[11px] text-white">
                                {item.label}
                              </p>
                              <span className="shrink-0 font-mono text-[10px] text-white">
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

        {/* ═══════════════════════════════════════════════════════════════════
            REALISTIC "MESSY" HUMAN INTERACTION · LIVE REP DEAL ROOM QUERY
           ═══════════════════════════════════════════════════════════════════ */}
        <motion.div
          className="mt-24 overflow-hidden rounded-2xl border border-white/[0.1] bg-[#09090c] shadow-[0_24px_80px_-20px_rgba(0,0,0,0.9)]"
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.55 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          {/* App Breadcrumb Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-white/[0.07] border-b bg-[#0c0c11] px-5 py-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-500">Workspace</span>
              <span className="text-zinc-700">/</span>
              <span className="text-zinc-400">Deal Room</span>
              <span className="text-zinc-700">/</span>
              <span className="font-medium text-white">
                Acme Corp ($68k Annual · Stage 4 Negotiation)
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px] text-zinc-400">
              <span>3 sources active</span>
              <span className="text-zinc-700">&middot;</span>
              <span className="text-emerald-400">164ms retrieval</span>
            </div>
          </div>

          <div className="grid grid-cols-1 divide-y divide-white/[0.07] lg:grid-cols-12 lg:divide-x lg:divide-y-0">
            {/* Left 7 Cols: Unfiltered Rep Prompt + Cited Answer */}
            <div className="space-y-6 p-6 sm:p-8 lg:col-span-7">
              {/* Messy Human Rep Message */}
              <div className="flex items-start gap-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-zinc-800 font-semibold text-white text-xs">
                  MK
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-white text-xs">
                      Maya Lin
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      Senior AE &middot; 4:47 PM
                    </span>
                  </div>
                  <div className="mt-2 rounded-2xl rounded-tl-sm border border-white/[0.08] bg-[#111117] px-4 py-3 text-sm text-zinc-200 leading-relaxed">
                    hey can we give acme a 20% discount on annual if they sign
                    by friday or does legal block that? also they&apos;re asking
                    if standard msa covers eu data residency
                  </div>
                </div>
              </div>

              {/* Grounded Salesient Response */}
              <div className="flex items-start gap-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 font-mono font-semibold text-[11px] text-emerald-400">
                  S
                </div>
                <div className="min-w-0 flex-1 space-y-3.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-white text-xs">
                      Salesient Deal Desk
                    </span>
                    <span className="rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                      Grounded in 3 files
                    </span>
                  </div>

                  <div className="space-y-3 rounded-2xl rounded-tl-sm border border-white/[0.07] bg-[#060609] p-4 text-xs text-zinc-300 leading-relaxed sm:text-sm">
                    <p>
                      <strong className="text-white">
                        1. 20% Annual Discount — Allowed with VP Sales sign-off
                        (No Legal redline needed):
                      </strong>{" "}
                      AE self-serve discounting caps at{" "}
                      <span className="font-medium text-white">15%</span>.
                      However, for annual commits over{" "}
                      <span className="font-medium text-white">$50k ACV</span>{" "}
                      closing before Friday EOQ, discounts up to{" "}
                      <span className="font-medium text-white">22%</span> only
                      require VP Sales approval in Salesforce—Legal does not
                      block or review standard order form discounts{" "}
                      <span className="inline-flex items-center gap-1 rounded border border-white/15 bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-white">
                        <FileText className="h-2.5 w-2.5" />
                        Q4_Playbook.pdf · §3.2, p.14
                      </span>
                      .
                    </p>

                    <p>
                      <strong className="text-white">
                        2. EU Data Residency — Requires Annex B Checkbox:
                      </strong>{" "}
                      Acme&apos;s current draft MSA defaults to{" "}
                      <code className="rounded bg-white/[0.06] px-1 py-0.5 font-mono text-[11px] text-zinc-200">
                        us-east-1
                      </code>
                      . To lock AWS Frankfurt (
                      <code className="rounded bg-white/[0.06] px-1 py-0.5 font-mono text-[11px] text-zinc-200">
                        eu-central-1
                      </code>
                      ), check{" "}
                      <span className="font-medium text-white">
                        Box 2 in Order Form Annex B
                      </span>{" "}
                      at no extra fee since Acme is on the Enterprise tier ($68k
                      ACV){" "}
                      <span className="inline-flex items-center gap-1 rounded border border-white/15 bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-white">
                        <FileText className="h-2.5 w-2.5" />
                        Acme_MSA_v3.pdf · §7.1, p.6
                      </span>
                      .
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Verifiable Source Passage Inspector */}
            <div className="flex flex-col justify-between bg-[#07070a] p-6 sm:p-8 lg:col-span-5">
              <div>
                <div className="flex items-center justify-between border-white/[0.07] border-b pb-3">
                  <span className="font-mono text-[11px] text-zinc-400 uppercase tracking-wider">
                    Verified Source Passages
                  </span>
                  <span className="font-mono text-[10px] text-zinc-500">
                    Exact match
                  </span>
                </div>

                <div className="mt-4 space-y-3.5">
                  <div className="rounded-xl border border-white/[0.08] bg-[#0b0b10] p-3.5">
                    <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400">
                      <span className="text-white">
                        Q4_Enterprise_Playbook.pdf
                      </span>
                      <span>Page 14 · §3.2</span>
                    </div>
                    <p className="mt-2 border-emerald-400/70 border-l-2 pl-3 font-mono text-[11px] text-zinc-300 leading-relaxed">
                      &ldquo;Discounts between 15.1% and 22.0% on Annual Upfront
                      Order Forms (&gt;$50,000 ACV) require VP Sales approval
                      via Deal Desk workflow. Legal review is waived if standard
                      payment terms (Net 30) remain unmodified.&rdquo;
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/[0.08] bg-[#0b0b10] p-3.5">
                    <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400">
                      <span className="text-white">Acme_MSA_v3.pdf</span>
                      <span>Page 6 · §7.1</span>
                    </div>
                    <p className="mt-2 border-white/40 border-l-2 pl-3 font-mono text-[11px] text-zinc-300 leading-relaxed">
                      &ldquo;Customer Data shall be hosted in the US-East region
                      unless EU-Central (Frankfurt) is selected on the
                      applicable Order Form Annex B. Regional pinning is
                      included for Enterprise subscriptions.&rdquo;
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-5 font-mono text-[11px] text-zinc-500">
                Synced with Salesforce Opportunity #SF-8841 (Acme Corp · $68,000
                ACV)
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
