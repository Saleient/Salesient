"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Suspense } from "react";
import ContactForm from "@/components/contact-form";

const contactInfo = [
  {
    label: "Sales & Solutions",
    value: "support@salesient.com",
    detail: "Workspace setup, custom integrations & enterprise inquiries",
  },
  {
    label: "Billing & Refunds",
    value: "billing@salesient.com",
    detail: "Pro plan activation, invoices & 14-day refund requests",
  },
  {
    label: "Response Time",
    value: "< 2 Hours",
    detail: "Priority support for Pro & Enterprise workspaces",
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

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Column — Context & Info */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col justify-between lg:col-span-5"
            initial={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.45 }}
          >
            <div>
              <h1 className="font-semibold text-4xl text-white tracking-[-0.03em] sm:text-5xl">
                Get in <span className="text-zinc-500">touch.</span>
              </h1>

              <p className="mt-4 text-sm text-zinc-400 leading-relaxed sm:text-base">
                Purchase a Pro subscription, request a custom CRM integration,
                or reach out to our team. Every Pro plan is backed by our{" "}
                <Link
                  className="text-zinc-200 underline underline-offset-4 hover:text-white"
                  href="/pricing#refund-policy"
                >
                  14-day 100% money-back guarantee
                </Link>
                .
              </p>

              <div className="mt-8 space-y-3">
                {contactInfo.map((item) => (
                  <div
                    className="rounded-2xl border border-white/[0.08] bg-[#09090c] p-4"
                    key={item.label}
                  >
                    <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
                      {item.label}
                    </p>
                    <p className="mt-0.5 font-semibold text-sm text-white">
                      {item.value}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {item.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column — Contact Form */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="rounded-3xl border border-white/[0.08] bg-[#09090c] p-6 sm:p-10">
              <div className="mb-6 border-white/[0.07] border-b pb-5">
                <h2 className="font-semibold text-white text-xl">
                  Send us a message
                </h2>
                <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
                  Select your plan or inquiry type below and we&apos;ll get back
                  to you shortly.
                </p>
              </div>
              <Suspense
                fallback={
                  <div className="py-12 text-center font-mono text-xs text-zinc-500">
                    Loading form...
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
