"use client";

import { Check, Minus } from "lucide-react";
import { motion } from "motion/react";

const governanceRows = [
  {
    control: "Model Training Policy",
    generic: "Prompts and files often retained for model fine-tuning",
    salesient:
      "Customer documents, CRM records, and queries are never used for training",
  },
  {
    control: "Workspace Isolation",
    generic: "Shared multi-tenant index with soft metadata filters",
    salesient:
      "Isolated per-organization storage and strict role-based access controls",
  },
  {
    control: "Data Encryption",
    generic: "Standard transport encryption with opaque storage keys",
    salesient:
      "Encrypted at rest and in transit with US and EU regional data residency",
  },
  {
    control: "Answer Verification",
    generic: "Free-text generation prone to fabricated contract terms",
    salesient:
      "Every claim linked directly to the source document, page number, and section",
  },
];

const complianceBadges = [
  {
    imgSrc: "/gdpr.png",
    title: "GDPR",
    subtitle: "EU Data Protection",
  },
  {
    imgSrc: "/iso.png",
    title: "ISO 27001",
    subtitle: "Information Security",
  },
  {
    imgSrc: "/soc2.png",
    title: "SOC 2 Type II",
    subtitle: "Security Controls",
  },
];

export default function Security() {
  return (
    <section className="relative w-full overflow-hidden bg-[#050507] px-4 py-20 sm:px-6 md:py-24 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-[#09090c] p-6 sm:p-10">
          {/* Clean Top Header Row */}
          <div className="flex flex-col items-start justify-between gap-6 border-white/[0.07] border-b pb-8 lg:flex-row lg:items-end">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              transition={{ duration: 0.45 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <h2 className="max-w-xl font-semibold text-3xl text-white tracking-[-0.025em] sm:text-4xl">
                Built for security-first revenue teams.
              </h2>
            </motion.div>

            {/* Clean Compliance Badges */}
            <motion.div
              className="flex flex-wrap items-center gap-3"
              initial={{ opacity: 0, y: 14 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              {complianceBadges.map((badge) => (
                <div
                  className="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-[#060608] px-3.5 py-2"
                  key={badge.title}
                >
                  {/** biome-ignore lint/performance/noImgElement: compliance badge */}
                  {/** biome-ignore lint/correctness/useImageSize: CSS sized */}
                  <img
                    alt={badge.title}
                    className="h-7 w-7 object-contain opacity-90"
                    src={badge.imgSrc}
                  />
                  <div>
                    <p className="font-semibold text-white text-xs">
                      {badge.title}
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      {badge.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Clean Governance Comparison Table */}
          <motion.div
            className="mt-8 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#060608]"
            initial={{ opacity: 0, y: 14 }}
            transition={{ duration: 0.45 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <div className="hidden grid-cols-12 border-white/[0.07] border-b bg-[#0b0b10] px-6 py-3 font-mono text-[11px] text-zinc-400 uppercase tracking-wider md:grid">
              <div className="col-span-4">Control</div>
              <div className="col-span-4">Generic AI Wrappers</div>
              <div className="col-span-4 text-white">Salesient</div>
            </div>

            <div className="divide-y divide-white/[0.06]">
              {governanceRows.map((row) => (
                <div
                  className="grid grid-cols-1 gap-3 px-6 py-4 transition-colors hover:bg-white/[0.015] md:grid-cols-12 md:items-center md:gap-6"
                  key={row.control}
                >
                  <div className="md:col-span-4">
                    <p className="font-medium text-sm text-white">
                      {row.control}
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5 text-xs text-zinc-500 leading-relaxed md:col-span-4">
                    <Minus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-600" />
                    <span>{row.generic}</span>
                  </div>

                  <div className="flex items-start gap-2.5 text-xs text-zinc-200 leading-relaxed md:col-span-4">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                    <span>{row.salesient}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
