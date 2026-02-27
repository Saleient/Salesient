"use client";

import { motion } from "motion/react";
import { InView } from "@/components/ui/in-view";

const integrationImages = [
  { src: "/integrations/gmail.png", alt: "Gmail", color: "#EA4335" },
  { src: "/integrations/salesforce.png", alt: "Salesforce", color: "#00A1E0" },
  { src: "/integrations/slack.png", alt: "Slack", color: "#4A154B" },
  { src: "/integrations/zoho.png", alt: "Zoho", color: "#D4382C" },
];

/* ── Floating logo card with glassmorphism + glow ── */
function IntegrationCard({
  image,
  index,
}: {
  image: (typeof integrationImages)[number];
  index: number;
}) {
  return (
    <motion.div
      animate={{
        y: [0, -10, 0],
      }}
      className="group relative"
      initial={{ opacity: 0, scale: 0.6, y: 40 }}
      transition={{
        y: {
          duration: 3.5 + index * 0.6,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        },
      }}
      whileHover={{ scale: 1.1 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true }}
    >
      {/* Glow ring on hover */}
      <div
        className="absolute -inset-2 rounded-3xl opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-50"
        style={{ background: image.color }}
      />

      {/* Card surface */}
      <div className="relative flex h-28 w-28 items-center justify-center rounded-2xl border border-white/6 bg-linear-to-br from-white/5 to-white/1 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl transition-all duration-500 group-hover:border-white/15 group-hover:shadow-[0_8px_40px_rgba(0,0,0,0.5)] sm:h-32 sm:w-32 sm:p-6 md:h-36 md:w-36 md:rounded-3xl md:p-7">
        {/* Inner subtle glow */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-10 md:rounded-3xl"
          style={{
            background: `radial-gradient(circle at center, ${image.color}, transparent 70%)`,
          }}
        />
        {/** biome-ignore lint/performance/noImgElement: integration logo */}
        {/** biome-ignore lint/correctness/useImageSize: CSS-controlled sizing */}
        <img
          alt={image.alt}
          className="relative h-full w-full object-contain drop-shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_4px_20px_rgba(255,255,255,0.1)]"
          src={image.src}
        />
      </div>

      {/* Label */}
      <motion.span
        className="mt-3 block text-center font-medium text-xs tracking-wide text-white/30 transition-colors duration-300 group-hover:text-white/70 sm:text-sm"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 + index * 0.12 }}
      >
        {image.alt}
      </motion.span>
    </motion.div>
  );
}

/* ── Animated connecting line pulse ── */
function ConnectingLine({ delay }: { delay: number }) {
  return (
    <motion.div
      className="hidden h-px w-14 md:block lg:w-24"
      initial={{ scaleX: 0, opacity: 0 }}
      whileInView={{ scaleX: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.7, ease: "easeOut" }}
    >
      <div className="relative h-full w-full overflow-hidden">
        {/* Static base line */}
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent" />
        {/* Traveling pulse */}
        <motion.div
          className="absolute top-0 h-full bg-linear-to-r from-transparent via-sky-400/80 to-transparent"
          animate={{ left: ["-40%", "140%"] }}
          transition={{
            duration: 2.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: delay * 2,
            repeatDelay: 1,
          }}
          style={{ width: "30%" }}
        />
      </div>
    </motion.div>
  );
}

/* ── Ambient orbital glow behind the grid ── */
function OrbitalGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {/* Primary glow */}
      <motion.div
        className="absolute h-72 w-72 rounded-full bg-sky-500/4 blur-[80px] md:h-104 md:w-104"
        animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.45, 0.25] }}
        transition={{
          duration: 6,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      {/* Rotating orbit ring */}
      <motion.div
        className="absolute h-56 w-56 rounded-full border border-dashed border-white/4 md:h-80 md:w-80"
        animate={{ rotate: [0, 360] }}
        transition={{
          duration: 30,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />
      {/* Outer orbit */}
      <motion.div
        className="absolute h-96 w-96 rounded-full border border-white/2 md:h-128 md:w-lg"
        animate={{ rotate: [360, 0] }}
        transition={{
          duration: 40,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />
    </div>
  );
}

/* ── Stat pill ── */
function StatPill({
  value,
  label,
  delay,
}: {
  value: string;
  label: string;
  delay: number;
}) {
  return (
    <motion.div
      className="flex flex-col items-center gap-1 rounded-xl border border-white/6 bg-white/2 px-5 py-3 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
    >
      <span className="font-semibold text-lg text-sky-400">{value}</span>
      <span className="text-xs text-white/40">{label}</span>
    </motion.div>
  );
}

export default function Integration() {
  return (
    <section className="relative flex w-full justify-center overflow-hidden py-16 sm:py-20 md:py-28">
      {/* Subtle dot grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative flex w-full max-w-7xl flex-col gap-16 px-4 sm:px-6 md:gap-24">
        {/* ── Header ── */}
        <InView className="mx-auto w-fit!">
          <div className="flex flex-col items-center gap-6">
            {/* Badge with pulse indicator */}
            <motion.div
              className="flex items-center gap-2.5 rounded-full border border-sky-500/20 bg-sky-500/5 px-5 py-2"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500" />
              </span>
              <span className="text-xs font-semibold tracking-[0.2em] text-sky-400/80 uppercase">
                Integrations
              </span>
            </motion.div>

            {/* Heading */}
            <h2 className="max-w-3xl text-center font-semibold text-4xl leading-[1.08] tracking-tight md:text-5xl lg:text-[3.5rem]">
              <span className="bg-linear-to-b from-white via-white/90 to-white/35 bg-clip-text text-transparent">
                Connect Everything.
              </span>
              <br />
              <span className="bg-linear-to-r from-sky-300 via-sky-500 to-sky-600 bg-clip-text text-transparent">
                Seamlessly.
              </span>
            </h2>

            {/* Subtext */}
            <motion.p
              className="max-w-md text-center text-base leading-relaxed text-white/45 md:text-lg"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35, duration: 0.5 }}
            >
              Plug into your existing workflow with zero friction. Your tools,
              unified under one intelligent layer.
            </motion.p>
          </div>
        </InView>

        {/* ── Integration logo showcase ── */}
        <div className="relative flex items-center justify-center py-4 md:py-8">
          <OrbitalGlow />

          <div className="relative z-10 flex flex-wrap items-center justify-center gap-8 sm:gap-10 md:flex-nowrap md:gap-4 lg:gap-6">
            {integrationImages.map((image, index) => (
              <div className="flex items-center gap-4 lg:gap-6" key={image.src}>
                <IntegrationCard image={image} index={index} />
                {index < integrationImages.length - 1 && (
                  <ConnectingLine delay={0.5 + index * 0.2} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Stat pills row ── */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <StatPill delay={0.1} label="Categories" value="15+" />
          <StatPill delay={0.2} label="Uptime" value="99.9%" />
          <StatPill delay={0.3} label="Setup time" value="<2 min" />
        </motion.div>
      </div>
    </section>
  );
}
