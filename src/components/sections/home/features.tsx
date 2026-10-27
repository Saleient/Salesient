"use client";

import { GitBranch } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const treeStages = [
  {
    id: 0,
    step: "01",
    title: "Structure-Aware Indexing",
    summary:
      "Preserves nested pricing tables, schedules, and contract hierarchies across files and CRM.",
    breadcrumb: "vault/ingestion",
    leaves: [
      {
        branch: "├─",
        label: "Q4_Enterprise_Playbook.pdf",
        meta: "48 pages · 312 clauses",
        badge: "Indexed",
      },
      {
        branch: "├─",
        label: "Global_Rate_Card_2025.xlsx",
        meta: "6 sheets · Tables intact",
        badge: "Parsed",
      },
      {
        branch: "└─",
        label: "Salesforce_Opportunities",
        meta: "1,420 active deal records",
        badge: "Synced",
      },
    ],
  },
  {
    id: 1,
    step: "02",
    title: "Semantic Chunking",
    summary:
      "Slices documents along clause and table boundaries so exact SKUs and terms stay together.",
    breadcrumb: "engine/index",
    leaves: [
      {
        branch: "├─",
        label: "Clause-Aware Slicing",
        meta: "Tables & sections preserved",
        badge: "312 chunks",
      },
      {
        branch: "├─",
        label: "Keyword + Context Match",
        meta: "Exact SKUs & clause intent",
        badge: "Ranked",
      },
      {
        branch: "└─",
        label: "Passage Verification",
        meta: "Top 4 source passages",
        badge: "Ready",
      },
    ],
  },
  {
    id: 2,
    step: "03",
    title: "Citation-Locked Answers",
    summary:
      "Every generated answer links directly to the exact source document, page number, and section.",
    breadcrumb: "deal-room/citations",
    leaves: [
      {
        branch: "├─",
        label: "SLA Concession Cap: 14.5%",
        meta: "Playbook_2025.pdf · §3.2, p.14",
        badge: "Verified",
      },
      {
        branch: "├─",
        label: "EU Residency: Frankfurt",
        meta: "Addendum.docx · §7.1, p.6",
        badge: "Verified",
      },
      {
        branch: "└─",
        label: "Liability Cap: 2x ACV",
        meta: "Executed_MSA.pdf · §11.3, p.27",
        badge: "Verified",
      },
    ],
  },
];

const activeBranchPaths = [
  "M450 0 V20 H150 V44",
  "M450 0 V44",
  "M450 0 V20 H750 V44",
];

export default function Features() {
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % treeStages.length);
    }, 3600);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      className="relative w-full overflow-hidden bg-[#050507] px-4 py-20 sm:px-6 md:py-24 lg:px-8"
      id="features"
    >
      <div className="mx-auto w-full max-w-7xl">
        {/* Clean Left-Aligned Section Header */}
        <motion.div
          className="flex flex-col justify-between gap-6 border-white/[0.07] border-b pb-8 lg:flex-row lg:items-end"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <h2 className="max-w-xl font-semibold text-3xl text-white tracking-[-0.025em] sm:text-4xl">
            How Salesient turns raw files into verifiable deal truth.
          </h2>
          <p className="max-w-md text-xs text-zinc-400 leading-relaxed sm:text-sm">
            Our three-stage pipeline preserves complex tables and links every
            answer to its exact source page.
          </p>
        </motion.div>

        {/* Compact Animated Tree Structure */}
        <div className="mt-10 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#09090c] p-5 sm:p-7">
          {/* Root Node */}
          <div className="flex flex-col items-center">
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/[0.1] bg-[#0d0d12] px-4 py-2 font-mono text-xs text-zinc-200">
              <GitBranch className="h-3.5 w-3.5 text-emerald-400" />
              <span>workspace/sources</span>
            </div>

            {/* Animated SVG Tree Branches */}
            <div className="relative hidden h-11 w-full max-w-4xl lg:block">
              <svg
                aria-hidden="true"
                className="h-full w-full overflow-visible"
                preserveAspectRatio="none"
                viewBox="0 0 900 44"
              >
                <path
                  d="M450 0 V20 M450 20 H150 V44 M450 20 V44 M450 20 H750 V44"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="1.5"
                />
                <motion.path
                  animate={{
                    d: activeBranchPaths[activeStage] ?? activeBranchPaths[0],
                  }}
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="1.75"
                  transition={{ duration: 0.35 }}
                />
              </svg>
            </div>
          </div>

          {/* Three Compact Stage Branches */}
          <div className="mt-4 grid grid-cols-1 gap-4 lg:mt-0 lg:grid-cols-3">
            {treeStages.map((stage, idx) => {
              const isActive = activeStage === idx;
              return (
                <motion.div
                  className={cn(
                    "flex cursor-pointer flex-col justify-between rounded-xl border p-4 transition-colors duration-300 sm:p-5",
                    isActive
                      ? "border-emerald-500/35 bg-[#0d0d13]"
                      : "border-white/[0.07] bg-[#07070a] hover:border-white/15"
                  )}
                  initial={{ opacity: 0, y: 14 }}
                  key={stage.step}
                  onClick={() => setActiveStage(idx)}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  viewport={{ once: true }}
                  whileInView={{ opacity: 1, y: 0 }}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "font-mono text-xs",
                          isActive ? "text-emerald-400" : "text-zinc-500"
                        )}
                      >
                        {stage.step}
                      </span>
                      <span className="font-mono text-[10px] text-zinc-500">
                        ./{stage.breadcrumb}
                      </span>
                    </div>

                    <h3 className="mt-2 font-semibold text-base text-white tracking-tight">
                      {stage.title}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                      {stage.summary}
                    </p>

                    {/* Nested Sub-Tree Leaves */}
                    <div className="relative mt-4 space-y-2 rounded-lg border border-white/[0.06] bg-[#050508] p-3 pl-4">
                      <div className="absolute top-3 bottom-3 left-3 w-px bg-white/[0.08]">
                        {isActive && (
                          <motion.div
                            animate={{ top: ["0%", "85%", "0%"] }}
                            className="-left-[1.5px] absolute h-2 w-1 rounded-full bg-emerald-400"
                            transition={{
                              duration: 2.4,
                              repeat: Number.POSITIVE_INFINITY,
                              ease: "easeInOut",
                            }}
                          />
                        )}
                      </div>

                      {stage.leaves.map((leaf) => (
                        <div
                          className="flex items-center justify-between gap-2 pl-2"
                          key={leaf.label}
                        >
                          <div className="flex min-w-0 items-baseline gap-2">
                            <span
                              className={cn(
                                "shrink-0 font-mono text-xs",
                                isActive
                                  ? "text-emerald-400/80"
                                  : "text-zinc-600"
                              )}
                            >
                              {leaf.branch}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-[11.5px] text-zinc-200">
                                {leaf.label}
                              </p>
                              <p className="truncate font-mono text-[10px] text-zinc-500">
                                {leaf.meta}
                              </p>
                            </div>
                          </div>

                          <span
                            className={cn(
                              "shrink-0 rounded px-1.5 py-0.5 font-mono text-[9.5px]",
                              isActive
                                ? "bg-emerald-500/10 text-emerald-300"
                                : "bg-white/[0.04] text-zinc-400"
                            )}
                          >
                            {leaf.badge}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
