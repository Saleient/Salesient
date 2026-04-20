"use client";

import { motion } from "motion/react";
import Features from "@/components/sections/home/features";
import Hero from "@/components/sections/home/hero";
import Integration from "@/components/sections/home/integrations";
import Security from "@/components/sections/home/security";

const springSmooth = { type: "spring" as const, stiffness: 120, damping: 20 };
const missionMetrics = [
  { label: "Revenue Intelligence", value: "Unified" },
  { label: "Document Workflows", value: "Automated" },
  { label: "Execution Speed", value: "Accelerated" },
  { label: "Decision Quality", value: "Evidence-Backed" },
];

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Security />
      <section
        className="relative flex flex-col items-center justify-center bg-black px-5 py-20 sm:px-10 md:py-28"
        id="quote"
      >
        {/* Subtle radial glow */}
        <motion.div
          className="pointer-events-none absolute top-1/2 left-1/2 h-125 w-200 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03)_0%,transparent_60%)]"
          animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative z-10 mx-auto flex w-full max-w-360 flex-col gap-6 text-center md:gap-8">
          <motion.div
            className="relative overflow-hidden rounded-3xl border border-white/8 bg-linear-to-b from-white/4 to-transparent px-6 py-12 md:px-14 md:py-16"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ ...springSmooth }}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-linear-to-b from-white/5 to-transparent" />
            <motion.div
              className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/3 px-4 py-1.5 text-xs tracking-widest text-white/40 uppercase"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ...springSmooth }}
            >
              <motion.span
                className="inline-block h-1.5 w-1.5 rounded-full bg-white/30"
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY }}
              />
              Our Mission
            </motion.div>
            <motion.blockquote
              className="mx-auto max-w-5xl text-balance text-2xl leading-snug md:text-4xl lg:text-5xl"
              initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{
                delay: 0.15,
                ...springSmooth,
                filter: { duration: 0.6 },
              }}
            >
              <span className="font-light text-white/40">
                &ldquo;We transform{" "}
              </span>
              <span className="font-semibold text-white">your data</span>
              <span className="font-light text-white/40"> into </span>
              <span className="font-semibold text-white">
                actionable intelligence
              </span>
              <span className="font-light text-white/40">, mapping your</span>
              <span className="font-semibold text-white"> sales pipeline</span>
              <span className="font-light text-white/40"> and leveraging </span>
              <span className="font-semibold text-white">AI</span>
              <span className="font-light text-white/40">
                to drive measurable results. We don&apos;t just analyze &mdash;{" "}
              </span>
              <span className="font-semibold text-white">we execute</span>
              <span className="font-light text-white/40">.&rdquo;</span>
            </motion.blockquote>
            <motion.div
              className="mt-8 h-px w-full max-w-md bg-linear-to-r from-transparent via-white/10 to-transparent"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{
                delay: 0.4,
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
              }}
            />

            <motion.p
              className="mt-4 text-sm text-white/35"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.45 }}
            >
              Salesient Team · AI Revenue Systems
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 gap-3 md:grid-cols-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            {missionMetrics.map((metric) => (
              <div
                className="rounded-xl border border-white/7 bg-white/2 px-4 py-3 text-left md:text-center"
                key={metric.label}
              >
                <p className="font-medium text-sm text-white/80 md:text-base">
                  {metric.value}
                </p>
                <p className="text-[11px] text-white/35 uppercase tracking-wide">
                  {metric.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <Integration />
    </>
  );
}
