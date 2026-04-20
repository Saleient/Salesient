"use client";

import { motion } from "motion/react";
import { GradientCard } from "@/components/gradient-button";

const springSmooth = { type: "spring" as const, stiffness: 120, damping: 20 };
const trustSignals = [
  { value: "2 min", label: "Average setup" },
  { value: "99.9%", label: "Platform uptime" },
  { value: "50+", label: "Native integrations" },
];

/* ── Floating particles for cinematic depth ── */
function HeroParticles() {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    size: Math.random() * 2.5 + 1,
    x: Math.random() * 100,
    y: 20 + Math.random() * 60,
    duration: Math.random() * 10 + 8,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.15 + 0.05,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
          animate={{
            y: [0, -40, 0],
            opacity: [0, p.opacity, p.opacity, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative mx-auto flex min-h-screen w-full flex-col items-center overflow-hidden bg-black px-4 pb-12 pt-20 sm:px-5 md:px-10 md:pb-20">
      {/* Subtle radial glow — animated breathing */}
      <motion.div
        className="pointer-events-none absolute top-0 left-1/2 h-175 w-250 -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.04)_0%,transparent_70%)]"
        animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Secondary color glow */}
      <motion.div
        className="pointer-events-none absolute top-32 left-1/2 h-100 w-150 -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)]"
        animate={{
          scale: [1, 1.12, 1],
          opacity: [0.5, 0.8, 0.5],
          x: ["-50%", "-48%", "-52%", "-50%"],
        }}
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Decorative grid lines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <HeroParticles />

      {/* Content */}
      <div className="z-10 mx-auto mt-10 flex w-full max-w-360 flex-col gap-6 sm:mt-16 sm:gap-7 md:items-center md:pt-10">
        {/* Animated badge */}
        <motion.div
          className="flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/3 px-5 py-2 text-sm text-white/60 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ scale: 1.05, borderColor: "rgba(255,255,255,0.2)" }}
        >
          <motion.span
            className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]"
            animate={{
              boxShadow: [
                "0 0 6px rgba(16,185,129,0.6)",
                "0 0 12px rgba(16,185,129,0.8)",
                "0 0 6px rgba(16,185,129,0.6)",
              ],
            }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          />
          Salesient
        </motion.div>

        {/* Heading with staggered word reveal */}
        <h1 className="w-full px-0 text-balance font-semibold text-4xl leading-[1.03] tracking-[-0.02em] sm:max-w-7xl sm:text-6xl md:text-center md:text-7xl lg:text-[5.25rem]">
          <motion.span
            className="inline-block bg-linear-to-b from-white via-white to-white/40 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.25, ...springSmooth }}
          >
            Accelerate Revenue.
          </motion.span>
          <br className="hidden md:block" />
          <motion.span
            className="inline-block bg-linear-to-b from-white/80 to-white/30 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.45, ...springSmooth }}
          >
            Eliminate Document Friction.
          </motion.span>
        </h1>

        {/* Subtitle with fade and blur */}
        <motion.p
          className="w-full max-w-3xl text-balance text-base text-white/42 leading-relaxed sm:px-0 sm:text-lg md:text-center md:text-xl"
          initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.65, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          Centralize proposals, playbooks, and contracts, then turn every
          customer conversation into actionable AI-guided next steps.
        </motion.p>

        {/* CTA buttons with entrance animation */}
        <motion.div
          className="mt-3 flex w-full flex-wrap items-center gap-3 px-1 sm:px-0 md:justify-center"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, ...springSmooth }}
        >
          <GradientCard href="/login">
            <span>Start Free</span>
            <span>Get Started</span>
          </GradientCard>
          <motion.a
            className="group inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/3 px-6 py-2.5 text-sm text-white/60 backdrop-blur-sm transition-all hover:border-white/20 hover:text-white/85"
            href="/pricing"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Compare Plans
            <motion.span
              className="inline-block"
              animate={{ x: [0, 3, 0] }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              →
            </motion.span>
          </motion.a>
        </motion.div>

        {/* Trust strip */}
        <motion.div
          className="mt-4 w-full"
          initial={{ opacity: 0, y: 18, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 1.05, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="grid w-full grid-cols-1 gap-2 rounded-2xl border border-white/8 bg-white/2 p-2 sm:grid-cols-3">
            {trustSignals.map((signal) => (
              <div
                className="rounded-xl border border-white/6 bg-white/2 px-4 py-3 text-left md:text-center"
                key={signal.label}
              >
                <p className="font-medium text-base text-white/80">
                  {signal.value}
                </p>
                <p className="text-white/35 text-xs tracking-wide uppercase">
                  {signal.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom fade gradient */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-black to-transparent" />
    </section>
  );
}
