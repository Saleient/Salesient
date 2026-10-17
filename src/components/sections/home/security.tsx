"use client";

import { Check, Minus } from "lucide-react";
import { motion } from "motion/react";

const governanceRows = [
  {
    control: "Foundation Model Training",
    spec: "Strict ZDR Endpoints",
    generic: "Prompts & files often retained for model fine-tuning",
    salesient:
      "Zero data retention or training on customer PDFs, CRM records, or queries",
  },
  {
    control: "Vector Index Tenancy",
    spec: "Per-Org Namespaces",
    generic: "Shared multi-tenant index with soft metadata filters",
    salesient:
      "Cryptographically isolated per-workspace vector namespaces & row-level ACLs",
  },
  {
    control: "Encryption & Key Custody",
    spec: "AES-256 & TLS 1.3",
    generic: "Standard transport encryption; opaque storage keys",
    salesient:
      "AES-256 at rest, TLS 1.3 in transit, with regional pinning (US-East / EU-Central)",
  },
  {
    control: "Output Verification",
    spec: "Deterministic Guardrail",
    generic: "Unbounded free-text generation prone to fabricated clauses",
    salesient:
      "Every claim locked to source document, page number, and section with audit logs",
  },
];

const complianceBadges = [
  {
    imgSrc: "/gdpr.png",
    title: "GDPR Compliant",
    subtitle: "EU Data Protection & Art. 28 DPA",
  },
  {
    imgSrc: "/iso.png",
    title: "ISO 27001",
    subtitle: "Information Security Management",
  },
  {
    imgSrc: "/soc2.png",
    title: "SOC 2 Type II",
    subtitle: "Audited Security & Availability Controls",
  },
];

export default function Security() {
  return (
    <section className="relative w-full overflow-hidden bg-[#050507] px-4 py-24 sm:px-6 md:py-32 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-[#09090c] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-10 md:p-12">
          {/* Top Header Row — Plain mono eyebrow + Solid white H2 */}
          <div className="flex flex-col items-start justify-between gap-8 border-white/[0.07] border-b pb-10 lg:flex-row lg:items-end">
            <motion.div
              initial={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <p className="mb-2.5 font-mono text-xs text-zinc-400 uppercase tracking-widest">
                Enterprise Trust &amp; Governance
              </p>
              <h2 className="max-w-2xl font-semibold text-3xl text-white tracking-[-0.025em] sm:text-4xl">
                Built for security-first revenue organizations.
              </h2>
            </motion.div>

            {/* Compliance Badges Strip */}
            <motion.div
              className="flex flex-wrap items-center gap-3"
              initial={{ opacity: 0, x: 32 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              {complianceBadges.map((badge) => (
                <div
                  className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-[#060608] px-4 py-2.5"
                  key={badge.title}
                >
                  {/** biome-ignore lint/performance/noImgElement: compliance badge */}
                  {/** biome-ignore lint/correctness/useImageSize: CSS sized */}
                  <img
                    alt={badge.title}
                    className="h-8 w-8 object-contain opacity-90"
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

          {/* Single Clean Governance Comparison Table (Replaces 01/02/03 3-card grid) */}
          <motion.div
            className="mt-10 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#060608]"
            initial={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            {/* Table Column Headers (Desktop) */}
            <div className="hidden grid-cols-12 border-white/[0.07] border-b bg-[#0b0b10] px-6 py-3.5 font-mono text-[11px] text-zinc-400 uppercase tracking-wider md:grid">
              <div className="col-span-4">Control &amp; Spec</div>
              <div className="col-span-4">Generic AI Wrappers</div>
              <div className="col-span-4 text-white">Salesient Vault</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-white/[0.06]">
              {governanceRows.map((row) => (
                <div
                  className="grid grid-cols-1 gap-4 px-6 py-5 transition-colors hover:bg-white/[0.015] md:grid-cols-12 md:items-center md:gap-6"
                  key={row.control}
                >
                  {/* Control Name + Spec Badge */}
                  <div className="md:col-span-4">
                    <p className="font-semibold text-sm text-white">
                      {row.control}
                    </p>
                    <span className="mt-1.5 inline-block rounded border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] text-zinc-400">
                      {row.spec}
                    </span>
                  </div>

                  {/* Generic Wrapper Column */}
                  <div className="flex items-start gap-2.5 text-xs text-zinc-500 leading-relaxed md:col-span-4">
                    <Minus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-600" />
                    <span>{row.generic}</span>
                  </div>

                  {/* Salesient Column */}
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
