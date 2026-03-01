"use client";

import { motion } from "motion/react";
import Features from "@/components/sections/home/features";
import Hero from "@/components/sections/home/hero";
import Integration from "@/components/sections/home/integrations";
import Security from "@/components/sections/home/security";

const springSmooth = { type: "spring" as const, stiffness: 120, damping: 20 };

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Security />
      <section
        className="relative flex min-h-screen flex-col items-center justify-center bg-black px-5 pt-12 sm:px-10 md:pt-24"
        id="quote"
      >
        {/* Subtle radial glow */}
        <motion.div
          className="pointer-events-none absolute top-1/2 left-1/2 h-125 w-200 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02)_0%,transparent_60%)]"
          animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        <div className="z-10 mx-auto flex max-w-360 flex-col items-center justify-center gap-16 text-center md:gap-32">
          <div className="flex max-w-4xl flex-col items-center justify-center gap-6">
            <motion.div
              className="mb-4 flex items-center gap-2 rounded-full border border-white/10 bg-white/3 px-4 py-1.5 text-xs tracking-widest text-white/40 uppercase"
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
              className="text-2xl leading-snug md:text-4xl lg:text-5xl"
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
              <span className="font-light text-white/40">
                {" "}
                into actionable intelligence, mapping your{" "}
              </span>
              <span className="font-semibold text-white">sales pipeline</span>
              <span className="font-light text-white/40"> and leveraging </span>
              <span className="font-semibold text-white">AI</span>
              <span className="font-light text-white/40">
                {" "}
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
          </div>
          <Integration />
        </div>
      </section>
    </>
  );
}
