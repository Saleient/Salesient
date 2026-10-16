"use client";

import { Clock, Globe, Mail, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import ContactForm from "@/components/contact-form";

const contactInfo = [
  {
    icon: Mail,
    label: "Direct Support & Sales",
    value: "support@salesient.com",
    detail: "Routed directly to solutions engineering",
  },
  {
    icon: Clock,
    label: "Response SLA",
    value: "< 4 Hours (Business Days)",
    detail: "24/7 dedicated Slack channel for Enterprise",
  },
  {
    icon: Globe,
    label: "Infrastructure Regions",
    value: "US-East & EU-Central (Frankfurt)",
    detail: "Strict regional data residency options",
  },
];

export default function ContactPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050507] px-4 pt-32 pb-20 text-white sm:px-6 md:pt-40 md:pb-28 lg:px-8">
      {/* Subtle Grid & Top Spotlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grid-subtle [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000_25%,transparent_100%)]"
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Column — Context & SLA Info */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="flex flex-col justify-between lg:col-span-5"
          >
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 font-mono text-[11px] uppercase tracking-wider text-zinc-400">
                <Mail className="h-3.5 w-3.5 text-zinc-300" />
                <span>Solutions Engineering</span>
              </div>

              <h1 className="font-semibold text-4xl tracking-[-0.03em] text-white sm:text-5xl">
                Let&apos;s architect your{" "}
                <span className="text-zinc-500">deal workspace.</span>
              </h1>

              <p className="mt-4 text-sm text-zinc-400 leading-relaxed sm:text-base">
                Whether you need custom CRM schema mapping, SOC 2 security
                documentation, or enterprise seat licensing, our team is ready
                to help.
              </p>

              <div className="mt-8 space-y-3">
                {contactInfo.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="flex items-start gap-3.5 rounded-2xl border border-white/[0.08] bg-[#09090c] p-4"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-200">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                          {item.label}
                        </p>
                        <p className="mt-0.5 font-semibold text-xs text-white sm:text-sm">
                          {item.value}
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-500">
                          {item.detail}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                <span>Enterprise Security &amp; DPA Ready</span>
              </div>
              <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                Every inquiry and shared document is protected under strict NDA
                and SOC 2 Type II confidentiality controls.
              </p>
            </div>
          </motion.div>

          {/* Right Column — Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-7"
          >
            <div className="rounded-3xl border border-white/[0.08] bg-[#09090c] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-10">
              <div className="mb-8 border-b border-white/[0.07] pb-5">
                <h2 className="font-semibold text-xl text-white">
                  Send a direct message
                </h2>
                <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
                  Tell us about your team size, document volume, and target
                  integrations.
                </p>
              </div>
              <ContactForm />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
