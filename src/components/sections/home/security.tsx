"use client";

import { motion } from "motion/react";

const springSmooth = { type: "spring" as const, stiffness: 120, damping: 20 };

const securityItems = [
  {
    imgSrc: "/gdpr.png",
    alt: "GDPR Compliance",
    title: "GDPR Compliant",
    description:
      "Rigorous internal audit processes ensuring compliant data governance.",
  },
  {
    imgSrc: "/iso.png",
    alt: "ISO Standards",
    title: "ISO Certified",
    description:
      "Certified infrastructure meeting international ISO standards.",
  },
];

export default function Security() {
  return (
    <section className="flex justify-center bg-black px-5 py-12 sm:px-5 sm:py-16 md:px-10 md:py-24">
      <motion.div
        className="flex w-full max-w-360 flex-col gap-6 overflow-hidden rounded-2xl border border-white/6 bg-[#050505] md:flex-row md:gap-0"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ ...springSmooth }}
      >
        {/* Left side -- header content */}
        <header className="relative flex flex-col justify-center gap-6 p-7 md:w-1/2 md:p-14">
          {/* Ambient glow */}
          <div className="pointer-events-none absolute top-0 left-0 h-64 w-64 rounded-full bg-emerald-500/3 blur-[80px]" />

          <motion.div
            className="flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/3 px-4 py-1.5 text-xs tracking-widest text-white/40 uppercase"
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, ...springSmooth }}
          >
            <motion.span
              className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"
              animate={{
                boxShadow: [
                  "0 0 4px rgba(16,185,129,0.4)",
                  "0 0 10px rgba(16,185,129,0.7)",
                  "0 0 4px rgba(16,185,129,0.4)",
                ],
              }}
              transition={{
                duration: 2.5,
                repeat: Number.POSITIVE_INFINITY,
              }}
            />
            Security
          </motion.div>

          <motion.h2
            className="max-w-lg text-left font-medium text-3xl leading-tight md:text-4xl lg:text-5xl"
            initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, ...springSmooth }}
          >
            <span className="bg-linear-to-b from-white to-white/50 bg-clip-text text-transparent">
              Enterprise-Grade Data Security
            </span>
          </motion.h2>

          <motion.p
            className="max-w-lg text-white/40 sm:text-xl"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35, duration: 0.5 }}
          >
            Industry-leading compliance with GDPR and ISO standards to safeguard
            your most sensitive data.
          </motion.p>

          {/* Trust indicators */}
          <motion.div
            className="mt-2 flex flex-wrap items-center gap-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {["256-bit encryption", "SOC 2 Ready", "Zero-trust"].map(
              (label) => (
                <span
                  key={label}
                  className="flex items-center gap-1.5 text-xs text-white/25"
                >
                  <span className="inline-block h-1 w-1 rounded-full bg-emerald-500/50" />
                  {label}
                </span>
              )
            )}
          </motion.div>
        </header>

        {/* Right side -- compliance cards */}
        <section className="grid grid-cols-1 md:w-1/2">
          {securityItems.map(({ imgSrc, alt, title, description }, idx) => (
            <motion.article
              className="group relative flex flex-col gap-5 border border-white/6 p-7 text-left transition-colors duration-500 hover:bg-white/2 md:p-14"
              key={alt}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + idx * 0.15, ...springSmooth }}
            >
              {/* Hover glow */}
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
                <div className="absolute inset-0 bg-linear-to-br from-white/[0.01] to-transparent" />
              </div>

              <div className="relative flex items-center gap-4">
                <motion.img
                  alt={alt}
                  className="h-14 w-fit"
                  src={imgSrc}
                  whileHover={{ scale: 1.08 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
                <span className="text-sm font-medium text-white/60">
                  {title}
                </span>
              </div>

              <motion.p
                className="relative text-white/50"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + idx * 0.15 }}
              >
                {description}
              </motion.p>

              {/* Bottom accent line */}
              <motion.div
                className="absolute inset-x-0 bottom-0 h-px"
                style={{
                  background:
                    idx === 0
                      ? "linear-gradient(90deg, transparent, rgba(16,185,129,0.2), transparent)"
                      : "linear-gradient(90deg, transparent, rgba(56,189,248,0.2), transparent)",
                }}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 + idx * 0.15, duration: 0.8 }}
              />
            </motion.article>
          ))}
        </section>
      </motion.div>
    </section>
  );
}
