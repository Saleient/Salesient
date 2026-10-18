"use client";

import { Clock, CreditCard, Globe, Mail, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { Suspense } from "react";
import ContactForm from "@/components/contact-form";

const contactInfo = [
  {
    icon: Mail,
    label: "Direct Solutions & Sales Desk",
    value: "support@salesient.com",
    detail: "Direct routing to Solutions Engineering & Deal Desk",
  },
  {
    icon: CreditCard,
    label: "Commercial Billing & Refunds",
    value: "billing@salesient.com",
    detail: "Pro plan activation, invoices & 14-day refund guarantee",
  },
  {
    icon: Clock,
    label: "Guaranteed Response SLA",
    value: "< 2 Hours (Pro & Enterprise)",
    detail: "Dedicated Slack connect channel for paid workspaces",
  },
  {
    icon: Globe,
    label: "Cloud Residency Regions",
    value: "AWS US-East (Virginia) & EU-Central (Frankfurt)",
    detail: "Strict tenant-isolated vector & storage pinning",
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
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col justify-between lg:col-span-5"
            initial={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.45 }}
          >
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 font-mono text-[11px] text-zinc-400 uppercase tracking-wider">
                <Mail className="h-3.5 w-3.5 text-zinc-300" />
                <span>Solutions Engineering &amp; Commercial Desk</span>
              </div>

              <h1 className="font-semibold text-4xl text-white tracking-[-0.03em] sm:text-5xl">
                Activate your{" "}
                <span className="text-zinc-500">deal workspace.</span>
              </h1>

              <p className="mt-4 text-sm text-zinc-400 leading-relaxed sm:text-base">
                Purchase a Pro team subscription, request custom CRM schema
                mapping, or obtain our SOC 2 Type II security package. Every Pro
                plan is backed by our{" "}
                <Link
                  className="text-zinc-200 underline underline-offset-4 hover:text-white"
                  href="/pricing#refund-policy"
                >
                  14-day 100% money-back guarantee
                </Link>
                .
              </p>

              <div className="mt-8 space-y-3">
                {contactInfo.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      className="flex items-start gap-3.5 rounded-2xl border border-white/[0.08] bg-[#09090c] p-4"
                      key={item.label}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-200">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
                          {item.label}
                        </p>
                        <p className="mt-0.5 font-semibold text-white text-xs sm:text-sm">
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
              <div className="flex items-center gap-2 font-semibold text-emerald-400 text-xs">
                <ShieldCheck className="h-4 w-4" />
                <span>Enterprise Security, DPA &amp; Refund Protected</span>
              </div>
              <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                Every inquiry and shared document is protected under strict NDA
                and SOC 2 Type II controls. Pro subscriptions include a 14-day
                no-questions-asked refund policy.
              </p>
            </div>
          </motion.div>

          {/* Right Column — Contact Form */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="rounded-3xl border border-white/[0.08] bg-[#09090c] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-10">
              <div className="mb-6 border-white/[0.07] border-b pb-5">
                <h2 className="font-semibold text-white text-xl">
                  Workspace Onboarding &amp; Direct Inquiry
                </h2>
                <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
                  Select your plan or inquiry type below. We provision Pro
                  workspaces and custom CRM connectors the same business day.
                </p>
              </div>
              <Suspense
                fallback={
                  <div className="py-12 text-center font-mono text-xs text-zinc-500">
                    Loading onboarding form...
                  </div>
                }
              >
                <ContactForm />
              </Suspense>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
