"use client";

import { motion } from "motion/react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  FileText,
  ShieldCheck,
  Search,
  Copy,
  Database,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const trustMetrics = [
  { value: "< 200ms", label: "Vector Retrieval Latency" },
  { value: "100%", label: "Traceable Document Citations" },
  { value: "Zero", label: "Hallucinated Statements" },
  { value: "SOC 2 & GDPR", label: "Enterprise Security Ready" },
];

export default function Hero() {
  return (
    <section className="relative mx-auto flex w-full flex-col items-center overflow-hidden bg-black px-4 pt-28 pb-16 sm:px-6 md:pt-36 md:pb-24 lg:px-8">
      {/* Subtle top spotlight accent — clean, non-distracting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-120 w-180 -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06)_0%,transparent_70%)]"
      />

      {/* Hero Header & Headline */}
      <div className="z-10 mx-auto flex w-full max-w-4xl flex-col items-center text-center">
        {/* Release Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs text-zinc-300 backdrop-blur-md transition-colors hover:border-white/20"
        >
          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="font-medium tracking-wide">Salesient RAG 2.0</span>
          <span className="text-zinc-500">|</span>
          <span className="text-zinc-400">Contextual Sales Intelligence</span>
          <ArrowRight className="h-3 w-3 text-zinc-400" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="text-balance font-semibold text-4xl leading-[1.08] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-[4.75rem]"
        >
          Accelerate revenue.
          <br />
          <span className="text-zinc-400">Grounded in your documents.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="mt-6 max-w-2xl text-balance text-base text-zinc-400 leading-relaxed sm:text-lg md:text-xl"
        >
          Connect your proposals, battlecards, playbooks, and contracts.
          Salesient arms your sales reps with cited, real-time answers for every
          high-stakes deal conversation.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3.5"
        >
          <Link href="/login">
            <Button
              size="lg"
              className="group cursor-pointer rounded-full bg-white px-7 text-sm font-semibold text-black transition-all hover:bg-zinc-200"
            >
              Start Free Workspace
              <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
          <Link href="/pricing">
            <Button
              variant="outline"
              size="lg"
              className="cursor-pointer rounded-full border-white/10 bg-white/[0.02] px-6 text-sm text-zinc-300 backdrop-blur-sm transition-colors hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
            >
              Compare Plans
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* ── High-Fidelity Product Interface Mockup ── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mt-14 w-full max-w-5xl"
      >
        {/* Glow underneath card */}
        <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-linear-to-b from-white/[0.08] via-transparent to-transparent opacity-60 blur-xl" />

        {/* Window Shell */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.12] bg-[#09090b] shadow-[0_24px_80px_rgba(0,0,0,0.85)]">
          {/* Top Window Chrome */}
          <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#0c0c0e] px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              </div>
              <div className="hidden h-3.5 w-px bg-white/10 sm:block" />
              <div className="hidden items-center gap-2 text-xs text-zinc-400 sm:flex">
                <Database className="h-3.5 w-3.5 text-zinc-500" />
                <span>Enterprise Deal Room &middot; Stripe Expansion</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>RAG Index Active</span>
              </div>
              <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-zinc-400">
                v2.4
              </span>
            </div>
          </div>

          {/* Context File Tags Header */}
          <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.06] bg-[#09090b]/60 px-4 py-2.5 text-xs sm:px-6">
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              Verified Sources:
            </span>
            <div className="flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-zinc-300">
              <FileText className="h-3.5 w-3.5 text-zinc-400" />
              <span>Q4_Enterprise_Playbook.pdf</span>
              <span className="rounded bg-white/10 px-1 py-0.2 text-[9px] text-zinc-400">
                48 pages
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-zinc-300">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>SOC2_Compliance_Addendum.docx</span>
              <span className="rounded bg-white/10 px-1 py-0.2 text-[9px] text-zinc-400">
                Indexed
              </span>
            </div>
            <div className="hidden items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-zinc-300 md:flex">
              <Lock className="h-3.5 w-3.5 text-zinc-400" />
              <span>Master_Service_Agreement_2025.pdf</span>
            </div>
          </div>

          {/* Chat Demonstration Interface */}
          <div className="space-y-4 p-4 sm:p-6 md:p-8">
            {/* User Prompt */}
            <div className="flex items-start justify-end gap-3">
              <div className="max-w-xl rounded-2xl rounded-tr-sm border border-white/10 bg-zinc-900/90 px-4 py-3 text-sm text-zinc-200">
                <p className="font-medium">
                  What is our standard SLA discount policy for 2-year enterprise
                  commits, and what are the specific data residency guarantees
                  for EU clients?
                </p>
              </div>
            </div>

            {/* AI Assistant Output */}
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-white">
                <Sparkles className="h-4 w-4" />
              </div>

              <div className="flex-1 space-y-3 rounded-2xl rounded-tl-sm border border-white/[0.08] bg-[#0f0f12] p-4 text-sm sm:p-5">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 text-xs text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">
                      Salesient Assistant
                    </span>
                    <span className="text-zinc-500">&middot;</span>
                    <span className="text-[11px] text-zinc-400">
                      Synthesized 3 chunks in 184ms
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Evidence-backed</span>
                  </div>
                </div>

                <div className="space-y-2 text-zinc-300 leading-relaxed text-[13px] sm:text-sm">
                  <p>
                    Based on your verified sales documentation, here are the
                    exact contract terms:
                  </p>
                  <ul className="space-y-1.5 pl-1">
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
                      <span>
                        <strong className="text-white">
                          2-Year SLA Discount:
                        </strong>{" "}
                        Standard tier allows up to{" "}
                        <strong className="text-white">14.5% concession</strong>{" "}
                        on base licensing. Any concession exceeding 15% requires
                        VP approval.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
                      <span>
                        <strong className="text-white">
                          EU Data Residency:
                        </strong>{" "}
                        Fully segregated Frankfurt &amp; Dublin AWS regions with
                        GDPR Article 28 compliance and zero cross-border
                        telemetry.
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Inline Citations */}
                <div className="pt-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                    Source Citations:
                  </span>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    <div className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-zinc-300 transition-colors hover:border-white/20">
                      <FileText className="h-3 w-3 text-zinc-400" />
                      <span>Q4_Enterprise_Playbook.pdf</span>
                      <span className="font-mono text-zinc-500 text-[10px]">
                        § 3.2 (p. 14)
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-zinc-300 transition-colors hover:border-white/20">
                      <ShieldCheck className="h-3 w-3 text-emerald-400" />
                      <span>SOC2_Compliance_Addendum.docx</span>
                      <span className="font-mono text-zinc-500 text-[10px]">
                        § 7.1 (p. 6)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Action Footer */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] pt-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.02] px-2.5 py-1 text-xs text-zinc-400 hover:border-white/20 hover:text-white"
                    >
                      <Copy className="h-3 w-3" />
                      <span>Copy Talking Points</span>
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.02] px-2.5 py-1 text-xs text-zinc-400 hover:border-white/20 hover:text-white"
                    >
                      <span>Export to Deal Memo</span>
                    </button>
                  </div>
                  <span className="text-[11px] text-zinc-500">
                    Model: Groq / Cerebras RAG Pipeline
                  </span>
                </div>
              </div>
            </div>

            {/* Input prompt bar simulation */}
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-950/80 px-4 py-3">
              <Search className="h-4 w-4 text-zinc-500" />
              <span className="flex-1 text-xs text-zinc-500">
                Ask anything about your connected proposals, battlecards, or
                agreements...
              </span>
              <kbd className="hidden rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-zinc-400 sm:inline-block">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Trust Metrics Bar */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
        className="z-10 mt-14 w-full max-w-5xl"
      >
        <div className="grid grid-cols-2 gap-4 border-y border-white/[0.08] py-8 sm:grid-cols-4 sm:gap-6">
          {trustMetrics.map((metric) => (
            <div key={metric.label} className="text-center">
              <p className="font-semibold text-2xl tracking-tight text-white sm:text-3xl">
                {metric.value}
              </p>
              <p className="mt-1 text-xs text-zinc-400 leading-tight">
                {metric.label}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
