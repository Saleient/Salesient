"use client";

import { motion } from "motion/react";
import {
  Database,
  Layers,
  ShieldCheck,
  CheckCircle2,
  FileSearch,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Features from "@/components/sections/home/features";
import Hero from "@/components/sections/home/hero";
import Integration from "@/components/sections/home/integrations";
import Security from "@/components/sections/home/security";

const capabilities = [
  {
    icon: Database,
    tag: "Ingestion Engine",
    title: "Dense Vector & Structural Indexing",
    description:
      "Upload PDFs, spreadsheets, pitch decks, and agreements. Salesient parses tabular schemas and hierarchy to preserve exact clause context.",
    stats: "Supports PDF, DOCX, CSV, Notion, Drive",
  },
  {
    icon: FileSearch,
    tag: "Hybrid Retrieval",
    title: "Sub-Second Semantic Search",
    description:
      "Combines semantic embeddings with lexical keyword matching to pinpoint specific contract terms, competitive battlecards, and objection rebuttals.",
    stats: "Average query latency: < 190ms",
  },
  {
    icon: ShieldCheck,
    tag: "Guaranteed Truth",
    title: "100% Attributed Responses",
    description:
      "Strict RAG guardrails prevent model hallucinations. Every generated bullet point links directly back to the verified page and clause.",
    stats: "Zero hallucination tolerance",
  },
];

export default function Home() {
  return (
    <>
      <Hero />
      <Features />

      {/* ── Architecture & Capabilities Section ── */}
      <section className="relative bg-black px-4 py-20 sm:px-6 md:py-28 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 text-xs text-zinc-300"
            >
              <Layers className="h-3.5 w-3.5 text-zinc-400" />
              <span className="font-medium uppercase tracking-wider text-[11px]">
                Engineered For Precision
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="max-w-3xl font-semibold text-3xl tracking-tight text-white sm:text-5xl md:text-6xl"
            >
              No hallucinations.
              <br />
              <span className="text-zinc-500">
                Every single sentence is verified.
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-5 max-w-2xl text-base text-zinc-400 leading-relaxed sm:text-lg"
            >
              Standard AI chatbots invent plausible-sounding terms. Salesient is
              built specifically for high-stakes revenue conversations where
              accuracy is non-negotiable.
            </motion.p>
          </div>

          {/* Capability Cards Grid */}
          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
            {capabilities.map((cap, idx) => {
              const Icon = cap.icon;
              return (
                <motion.div
                  key={cap.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-[#09090b] p-7 transition-colors hover:border-white/20"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white">
                        <Icon className="h-5 w-5 text-zinc-300" />
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/[0.02] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                        {cap.tag}
                      </span>
                    </div>

                    <h3 className="mt-6 font-semibold text-xl text-white">
                      {cap.title}
                    </h3>
                    <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
                      {cap.description}
                    </p>
                  </div>

                  <div className="mt-8 border-t border-white/[0.06] pt-4">
                    <span className="text-xs font-medium text-zinc-500">
                      {cap.stats}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <Security />
      <Integration />
    </>
  );
}
