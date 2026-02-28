"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { InView } from "@/components/ui/in-view";
import { useCallback, useEffect, useRef, useState } from "react";

const integrationImages = [
  { src: "/integrations/gmail.png", alt: "Gmail", color: "#EA4335" },
  { src: "/integrations/salesforce.png", alt: "Salesforce", color: "#00A1E0" },
  { src: "/integrations/slack.png", alt: "Slack", color: "#4A154B" },
  { src: "/integrations/zoho.png", alt: "Zoho", color: "#D4382C" },
];

/* ── Spring configs for consistent physics ── */
const springSmooth = { type: "spring" as const, stiffness: 120, damping: 20 };
const springSnappy = { type: "spring" as const, stiffness: 300, damping: 25 };
const springBouncy = { type: "spring" as const, stiffness: 400, damping: 15 };

/* ── Stagger container variants ── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.5, y: 60, filter: "blur(12px)" },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      ...springSmooth,
      opacity: { duration: 0.5 },
      filter: { duration: 0.6 },
    },
  },
};

/* ── 3D Tilt card with magnetic hover ── */
function IntegrationCard({
  image,
  index,
}: {
  image: (typeof integrationImages)[number];
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), {
    stiffness: 200,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 200,
    damping: 20,
  });
  const glowX = useSpring(useTransform(mouseX, [-0.5, 0.5], [20, 80]), {
    stiffness: 200,
    damping: 20,
  });
  const glowY = useSpring(useTransform(mouseY, [-0.5, 0.5], [20, 80]), {
    stiffness: 200,
    damping: 20,
  });

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    },
    [mouseX, mouseY]
  );

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      className="group relative"
      style={{ perspective: 800 }}
      variants={cardVariants}
    >
      {/* Floating animation */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{
          y: {
            duration: 4 + index * 0.8,
            repeat: Number.POSITIVE_INFINITY,
            ease: [0.37, 0, 0.63, 1],
          },
        }}
      >
        {/* 3D tilt wrapper */}
        <motion.div
          ref={cardRef}
          className="relative cursor-pointer"
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          whileHover={{ scale: 1.08 }}
          transition={springSnappy}
        >
          {/* Outer glow ring */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="absolute -inset-3 rounded-3xl blur-2xl"
                style={{ background: image.color }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.4, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
              />
            )}
          </AnimatePresence>

          {/* Card surface with dynamic highlight */}
          <motion.div
            className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border border-white/6 bg-linear-to-br from-white/6 to-white/2 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:h-32 sm:w-32 sm:p-6 md:h-36 md:w-36 md:rounded-3xl md:p-7"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Specular highlight that follows cursor */}
            <motion.div
              className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:rounded-3xl"
              style={{
                background: useTransform(
                  [glowX, glowY],
                  ([x, y]: number[]) =>
                    `radial-gradient(circle at ${x}% ${y}%, ${image.color}15, transparent 60%)`
                ),
              }}
            />

            {/* Shimmer border on hover */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  className="pointer-events-none absolute inset-0 rounded-2xl md:rounded-3xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    background: `linear-gradient(135deg, ${image.color}30, transparent 40%, transparent 60%, ${image.color}20)`,
                    mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    maskComposite: "exclude",
                    padding: "1px",
                    borderRadius: "inherit",
                  }}
                />
              )}
            </AnimatePresence>

            {/* Logo with 3D lift */}
            {/** biome-ignore lint/performance/noImgElement: integration logo */}
            {/** biome-ignore lint/correctness/useImageSize: CSS-controlled sizing */}
            <motion.img
              alt={image.alt}
              className="relative h-full w-full object-contain"
              src={image.src}
              style={{
                translateZ: 20,
                filter: isHovered
                  ? `drop-shadow(0 8px 24px ${image.color}40)`
                  : "drop-shadow(0 4px 12px rgba(0,0,0,0.3))",
                transition: "filter 0.4s ease",
              }}
              animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
              transition={springBouncy}
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Label with slide-up reveal */}
      <motion.span
        className="mt-3 block text-center font-medium text-xs tracking-wide text-white/30 sm:text-sm"
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 + index * 0.15, duration: 0.4 }}
        animate={isHovered ? { color: "rgba(255,255,255,0.7)" } : {}}
      >
        {image.alt}
      </motion.span>
    </motion.div>
  );
}

/* ── Animated connecting line with energy pulse ── */
function ConnectingLine({ delay, color }: { delay: number; color: string }) {
  return (
    <motion.div
      className="hidden h-px w-14 md:block lg:w-24"
      initial={{ scaleX: 0, opacity: 0 }}
      whileInView={{ scaleX: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{
        delay,
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div className="relative h-full w-full overflow-hidden">
        {/* Static base line with gradient */}
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/8 to-transparent" />

        {/* Primary traveling pulse */}
        <motion.div
          className="absolute top-0 h-full"
          animate={{ left: ["-40%", "140%"] }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: [0.37, 0, 0.63, 1],
            delay: delay * 1.5,
            repeatDelay: 1.2,
          }}
          style={{
            width: "35%",
            background: `linear-gradient(90deg, transparent, ${color}90, transparent)`,
          }}
        />

        {/* Secondary subtle pulse (offset) */}
        <motion.div
          className="absolute top-0 h-full"
          animate={{ left: ["-30%", "130%"] }}
          transition={{
            duration: 2.8,
            repeat: Number.POSITIVE_INFINITY,
            ease: [0.37, 0, 0.63, 1],
            delay: delay * 1.5 + 1.4,
            repeatDelay: 1.8,
          }}
          style={{
            width: "20%",
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
          }}
        />

        {/* Glow dot at the pulse tip */}
        <motion.div
          className="absolute -top-0.5 h-1 w-1 rounded-full"
          animate={{ left: ["-5%", "105%"] }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: [0.37, 0, 0.63, 1],
            delay: delay * 1.5,
            repeatDelay: 1.2,
          }}
          style={{
            background: color,
            boxShadow: `0 0 8px ${color}, 0 0 16px ${color}60`,
          }}
        />
      </div>
    </motion.div>
  );
}

/* ── Floating particles for ambient depth ── */
function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 8 + 6,
    delay: Math.random() * 4,
    opacity: Math.random() * 0.3 + 0.05,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-sky-400"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 10, -10, 0],
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

/* ── Ambient orbital glow behind the grid ── */
function OrbitalGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {/* Primary breathing glow */}
      <motion.div
        className="absolute h-72 w-72 rounded-full bg-sky-500/4 blur-[80px] md:h-104 md:w-104"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.45, 0.2],
        }}
        transition={{
          duration: 7,
          repeat: Number.POSITIVE_INFINITY,
          ease: [0.37, 0, 0.63, 1],
        }}
      />

      {/* Secondary warm glow */}
      <motion.div
        className="absolute h-52 w-52 rounded-full bg-purple-500/3 blur-[60px] md:h-80 md:w-80"
        animate={{
          scale: [1.1, 0.9, 1.1],
          opacity: [0.15, 0.3, 0.15],
          x: [-20, 20, -20],
        }}
        transition={{
          duration: 9,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Inner dashed orbit ring */}
      <motion.div
        className="absolute h-48 w-48 rounded-full border border-dashed border-white/3 md:h-72 md:w-72"
        animate={{ rotate: [0, 360] }}
        transition={{
          duration: 35,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      >
        {/* Orbiting dot */}
        <motion.div
          className="absolute -top-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-sky-400/60"
          style={{ boxShadow: "0 0 6px rgba(56,189,248,0.4)" }}
        />
      </motion.div>

      {/* Middle orbit ring */}
      <motion.div
        className="absolute h-64 w-64 rounded-full border border-white/2 md:h-96 md:w-96"
        animate={{ rotate: [360, 0] }}
        transition={{
          duration: 45,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      >
        <motion.div
          className="absolute -right-0.5 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-purple-400/40"
          style={{ boxShadow: "0 0 6px rgba(192,132,252,0.3)" }}
        />
      </motion.div>

      {/* Outer orbit ring */}
      <motion.div
        className="absolute h-80 w-80 rounded-full border border-white/1.5 md:h-128 md:w-lg"
        animate={{ rotate: [0, 360] }}
        transition={{
          duration: 60,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      >
        <motion.div
          className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-sky-300/30"
          style={{ boxShadow: "0 0 4px rgba(125,211,252,0.3)" }}
        />
      </motion.div>

      <FloatingParticles />
    </div>
  );
}

/* ── Animated counter for stat values ── */
function AnimatedCounter({ value }: { value: string }) {
  const numericMatch = value.match(/(\d+\.?\d*)/);
  const prefix = value.slice(0, value.indexOf(numericMatch?.at(0) ?? "")) || "";
  const suffix = numericMatch
    ? value.slice(
        value.indexOf(numericMatch.at(0) ?? "") +
          (numericMatch.at(0) ?? "").length
      )
    : "";
  const targetNum = numericMatch
    ? Number.parseFloat(numericMatch.at(0) ?? "0")
    : 0;
  const hasDecimal = numericMatch?.at(0)?.includes(".") ?? false;

  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (hasAnimated || !counterRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setHasAnimated(true);
            const duration = 1_500;
            const startTime = performance.now();

            const animate = (currentTime: number) => {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              /* Ease-out cubic */
              const eased = 1 - (1 - progress) ** 3;
              setCount(eased * targetNum);
              if (progress < 1) {
                requestAnimationFrame(animate);
              }
            };
            requestAnimationFrame(animate);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(counterRef.current);
    return () => observer.disconnect();
  }, [hasAnimated, targetNum]);

  return (
    <span ref={counterRef}>
      {prefix}
      {hasDecimal ? count.toFixed(1) : Math.round(count)}
      {suffix}
    </span>
  );
}

/* ── Stat pill with shine effect ── */
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
      className="group relative flex flex-col items-center gap-1.5 overflow-hidden rounded-xl border border-white/6 bg-white/2 px-6 py-3.5 backdrop-blur-sm"
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, ...springSmooth }}
      whileHover={{ borderColor: "rgba(255,255,255,0.12)", y: -2 }}
    >
      {/* Shine sweep on hover */}
      <motion.div
        className="pointer-events-none absolute inset-0 -translate-x-full skew-x-12 bg-linear-to-r from-transparent via-white/4 to-transparent group-hover:translate-x-full"
        style={{ transition: "transform 0.8s ease" }}
      />

      <span className="font-semibold text-lg text-sky-400">
        <AnimatedCounter value={value} />
      </span>
      <span className="text-xs text-white/40">{label}</span>
    </motion.div>
  );
}

/* ── Central hub node (animated) ── */
function CentralHub() {
  return (
    <motion.div
      className="relative z-20 mx-4 hidden flex-col items-center md:flex"
      initial={{ opacity: 0, scale: 0 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.6, ...springBouncy }}
    >
      {/* Pulsing rings */}
      <div className="relative flex h-16 w-16 items-center justify-center">
        <motion.div
          className="absolute h-full w-full rounded-full border border-sky-400/20"
          animate={{ scale: [1, 1.6, 1.6], opacity: [0.6, 0, 0] }}
          transition={{
            duration: 2.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeOut",
          }}
        />
        <motion.div
          className="absolute h-full w-full rounded-full border border-sky-400/20"
          animate={{ scale: [1, 1.6, 1.6], opacity: [0.6, 0, 0] }}
          transition={{
            duration: 2.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeOut",
            delay: 0.8,
          }}
        />
        {/* Core circle */}
        <motion.div
          className="relative flex h-12 w-12 items-center justify-center rounded-full border border-sky-400/30 bg-sky-500/10 backdrop-blur-md"
          animate={{
            boxShadow: [
              "0 0 20px rgba(56,189,248,0.1)",
              "0 0 30px rgba(56,189,248,0.25)",
              "0 0 20px rgba(56,189,248,0.1)",
            ],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <svg
            className="h-5 w-5 text-sky-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <title>Integration hub</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.54a4.5 4.5 0 00-1.242-7.244l4.5-4.5a4.5 4.5 0 016.364 6.364l-1.757 1.757"
            />
          </svg>
        </motion.div>
      </div>
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

      {/* Top edge fade */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-black/60 to-transparent" />
      {/* Bottom edge fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-black/60 to-transparent" />

      <div className="relative flex w-full max-w-7xl flex-col gap-16 px-4 sm:px-6 md:gap-24">
        {/* ── Header ── */}
        <InView className="mx-auto w-fit!">
          <div className="flex flex-col items-center gap-6">
            {/* Badge with pulse indicator */}
            <motion.div
              className="flex items-center gap-2.5 rounded-full border border-sky-500/20 bg-sky-500/5 px-5 py-2 backdrop-blur-sm"
              whileHover={{ scale: 1.05, borderColor: "rgba(56,189,248,0.3)" }}
              transition={springBouncy}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500" />
              </span>
              <span className="text-xs font-semibold tracking-[0.2em] text-sky-400/80 uppercase">
                Integrations
              </span>
            </motion.div>

            {/* Heading with word-level stagger */}
            <h2 className="max-w-3xl text-center font-semibold text-4xl leading-[1.08] tracking-tight md:text-5xl lg:text-[3.5rem]">
              <motion.span
                className="inline-block bg-linear-to-b from-white via-white/90 to-white/35 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, ...springSmooth }}
              >
                Connect Everything.
              </motion.span>
              <br />
              <motion.span
                className="inline-block bg-linear-to-r from-sky-300 via-sky-500 to-sky-600 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25, ...springSmooth }}
              >
                Seamlessly.
              </motion.span>
            </h2>

            {/* Subtext with fade reveal */}
            <motion.p
              className="max-w-md text-center text-base leading-relaxed text-white/45 md:text-lg"
              initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{
                delay: 0.4,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              Plug into your existing workflow with zero friction. Your tools,
              unified under one intelligent layer.
            </motion.p>
          </div>
        </InView>

        {/* ── Integration logo showcase ── */}
        <div className="relative flex items-center justify-center py-4 md:py-8">
          <OrbitalGlow />

          <motion.div
            className="relative z-10 flex flex-wrap items-center justify-center gap-8 sm:gap-10 md:flex-nowrap md:gap-0 lg:gap-0"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            {/* First two integrations */}
            {integrationImages.slice(0, 2).map((image, index) => (
              <div className="flex items-center gap-0" key={image.src}>
                <IntegrationCard image={image} index={index} />
                <ConnectingLine delay={0.6 + index * 0.2} color={image.color} />
              </div>
            ))}

            {/* Central hub node */}
            <CentralHub />

            {/* Last two integrations */}
            {integrationImages.slice(2).map((image, index) => (
              <div className="flex items-center gap-0" key={image.src}>
                <ConnectingLine delay={0.8 + index * 0.2} color={image.color} />
                <IntegrationCard image={image} index={index + 2} />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
