"use client";

import { Check, Layers } from "lucide-react";
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

export default function Features() {
  return (
    <section
      id="features"
      className="relative w-full overflow-hidden bg-[#050507] px-4 py-24 sm:px-6 md:py-32 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
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
                    <span className="font-mono text-xs font-semibold text-white">
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
                        <Check className="h-3.5 w-3.5 text-white" />
                        {m}
                      </span>
                    ))}
                  </div>
                </motion.div>

                {/* Visual Video Card Column (Alternates Right / Left) */}
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
                          <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
                          <span className="font-mono text-[11px] text-zinc-300">
                            {stage.terminalTitle}
                          </span>
                        </div>
                        <span className="rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-0.5 font-mono text-[10px] text-white">
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
      </div>
    </section>
  );
}
