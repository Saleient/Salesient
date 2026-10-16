"use client";

import {
  CheckCircle2,
  EyeOff,
  KeyRound,
  Lock,
  Server,
  ShieldCheck,
} from "lucide-react";
import { motion } from "motion/react";

const securityPillars = [
  {
    icon: EyeOff,
    title: "Zero Model Training",
    spec: "Strict ZDR Endpoints",
    description:
      "Customer documents, CRM records, and chat prompts are never used to train or fine-tune foundation models.",
  },
  {
    icon: Server,
    title: "Tenant-Isolated Vectors",
    spec: "Per-Org Namespaces",
    description:
      "Every workspace operates inside a cryptographically isolated vector namespace with strict row-level ACL enforcement.",
  },
  {
    icon: KeyRound,
    title: "End-to-End Encryption",
    spec: "AES-256 & TLS 1.3",
    description:
      "All ingested files and embeddings are encrypted at rest with AES-256 and in transit via TLS 1.3.",
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
          {/* Top Header Row */}
          <div className="flex flex-col items-start justify-between gap-8 border-b border-white/[0.07] pb-10 lg:flex-row lg:items-end">
            <motion.div
              initial={{ opacity: 0, x: -32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.08] px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Enterprise Trust &amp; Governance</span>
              </div>
              <h2 className="max-w-2xl font-semibold text-3xl tracking-[-0.025em] text-white sm:text-4xl">
                Built for security-first{" "}
                <span className="text-zinc-500">revenue organizations.</span>
              </h2>
            </motion.div>

            {/* Compliance Badges Strip */}
            <motion.div
              initial={{ opacity: 0, x: 32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-wrap items-center gap-3"
            >
              {complianceBadges.map((badge) => (
                <div
                  key={badge.title}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-[#060608] px-4 py-2.5"
                >
                  {/** biome-ignore lint/performance/noImgElement: compliance badge */}
                  {/** biome-ignore lint/correctness/useImageSize: CSS sized */}
                  <img
                    alt={badge.title}
                    src={badge.imgSrc}
                    className="h-8 w-8 object-contain opacity-90"
                  />
                  <div>
                    <p className="font-semibold text-xs text-white">
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

          {/* 3-Column Security Architecture Pillars */}
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {securityPillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.title}
                  initial={{
                    opacity: 0,
                    x: idx === 0 ? -28 : idx === 2 ? 28 : 0,
                    y: idx === 1 ? 20 : 0,
                  }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  className="flex flex-col justify-between rounded-2xl border border-white/[0.06] bg-[#060608] p-6"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-200">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="rounded border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] text-zinc-400">
                        {pillar.spec}
                      </span>
                    </div>
                    <h3 className="mt-5 font-semibold text-base text-white">
                      {pillar.title}
                    </h3>
                    <p className="mt-2 text-xs text-zinc-400 leading-relaxed sm:text-sm">
                      {pillar.description}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center gap-1.5 border-t border-white/[0.05] pt-3.5 text-[11px] text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Enforced across all workspaces</span>
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
