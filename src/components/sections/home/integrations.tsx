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

/* ── Integration data ── */
const integrationImages = [
  {
    src: "/integrations/gmail.png",
    alt: "Gmail",
    color: "#EA4335",
    category: "Email",
    desc: "Sync emails & threads",
  },
  {
    src: "/integrations/salesforce.png",
    alt: "Salesforce",
    color: "#00A1E0",
    category: "CRM",
    desc: "Full CRM integration",
  },
  {
    src: "/integrations/slack.png",
    alt: "Slack",
    color: "#4A154B",
    category: "Messaging",
    desc: "Real-time notifications",
  },
  {
    src: "/integrations/zoho.png",
    alt: "Zoho",
    color: "#D4382C",
    category: "CRM",
    desc: "Pipeline & contacts sync",
  },
];

/* Extra integrations rendered as icon-only "coming soon" slots */
const upcomingIntegrations = [
  { name: "HubSpot", color: "#FF7A59", icon: "H" },
  { name: "Microsoft 365", color: "#0078D4", icon: "M" },
  { name: "Google Drive", color: "#4285F4", icon: "G" },
  { name: "Notion", color: "#FFFFFF", icon: "N" },
];

/* ── Spring physics ── */
const springSmooth = { type: "spring" as const, stiffness: 120, damping: 20 };
const springSnappy = { type: "spring" as const, stiffness: 300, damping: 25 };

/* ── Stagger variants ── */
const gridStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
};

const cardReveal = {
  hidden: { opacity: 0, y: 32, scale: 0.92, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      ...springSmooth,
      opacity: { duration: 0.5 },
      filter: { duration: 0.5 },
    },
  },
};

/* ═══════════════════════════════════════════════════════════════
   Integration Card — Glass-morphism with 3D tilt & status
   ═══════════════════════════════════════════════════════════════ */
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

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), {
    stiffness: 250,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), {
    stiffness: 250,
    damping: 22,
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
      mouseX.set((event.clientX - rect.left) / rect.width - 0.5);
      mouseY.set((event.clientY - rect.top) / rect.height - 0.5);
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
      style={{ perspective: 900 }}
      variants={cardReveal}
    >
      <motion.div
        ref={cardRef}
        className="relative cursor-pointer"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        whileHover={{ scale: 1.03 }}
        transition={springSnappy}
      >
        {/* Outer glow on hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="absolute -inset-2 rounded-3xl blur-2xl"
              style={{ background: image.color }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 0.12, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35 }}
            />
          )}
        </AnimatePresence>

        {/* Card body */}
        <div className="relative flex flex-col items-center overflow-hidden rounded-2xl border border-white/6 bg-linear-to-br from-white/6 to-white/2 px-6 py-6 shadow-[0_4px_24px_rgba(0,0,0,0.3)] backdrop-blur-xl sm:px-8 sm:py-8">
          {/* Specular highlight */}
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background: useTransform(
                [glowX, glowY],
                ([x, y]: number[]) =>
                  `radial-gradient(circle at ${x}% ${y}%, ${image.color}12, transparent 55%)`
              ),
            }}
          />

          {/* Shimmer border */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="pointer-events-none absolute inset-0 rounded-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  background: `linear-gradient(135deg, ${image.color}25, transparent 40%, transparent 60%, ${image.color}15)`,
                  mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  maskComposite: "exclude",
                  padding: "1px",
                  borderRadius: "inherit",
                }}
              />
            )}
          </AnimatePresence>

          {/* Status indicator */}
          <motion.div
            className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-2.5 py-1"
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{
              delay: 0.6 + index * 0.15,
              type: "spring",
              stiffness: 400,
            }}
          >
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-emerald-400"
              animate={{
                boxShadow: [
                  "0 0 3px rgba(52,211,153,0.4)",
                  "0 0 8px rgba(52,211,153,0.7)",
                  "0 0 3px rgba(52,211,153,0.4)",
                ],
              }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            />
            <span className="text-emerald-400/80 text-[9px] font-semibold uppercase tracking-wider">
              Live
            </span>
          </motion.div>

          {/* Logo */}
          <motion.div
            className="relative mb-4 flex h-16 w-16 items-center justify-center sm:h-20 sm:w-20"
            style={{ translateZ: 24 }}
          >
            {/** biome-ignore lint/performance/noImgElement: integration logo */}
            {/** biome-ignore lint/correctness/useImageSize: CSS-controlled sizing */}
            <motion.img
              alt={image.alt}
              className="h-full w-full object-contain"
              src={image.src}
              style={{
                filter: isHovered
                  ? `drop-shadow(0 6px 20px ${image.color}40)`
                  : "drop-shadow(0 4px 12px rgba(0,0,0,0.25))",
                transition: "filter 0.4s ease",
              }}
              animate={isHovered ? { scale: 1.08 } : { scale: 1 }}
              transition={springSnappy}
            />
          </motion.div>

          {/* Category chip */}
          <motion.span
            className="mb-2 rounded-full px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest"
            style={{
              backgroundColor: `${image.color}12`,
              color: `${image.color}BB`,
            }}
          >
            {image.category}
          </motion.span>

          {/* Name */}
          <span className="font-semibold text-sm text-white/70 tracking-wide sm:text-base">
            {image.alt}
          </span>

          {/* Description */}
          <span className="mt-1 text-center text-[11px] text-white/25 sm:text-xs">
            {image.desc}
          </span>

          {/* Bottom shine sweep */}
          <motion.div
            className="pointer-events-none absolute inset-0 -translate-x-full skew-x-12 bg-linear-to-r from-transparent via-white/3 to-transparent group-hover:translate-x-full"
            style={{ transition: "transform 0.9s ease" }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Upcoming / Coming Soon pill
   ═══════════════════════════════════════════════════════════════ */
function UpcomingPill({
  integration,
  index,
}: {
  integration: (typeof upcomingIntegrations)[number];
  index: number;
}) {
  return (
    <motion.div
      className="group relative flex items-center gap-3 rounded-xl border border-white/4 bg-white/2 px-4 py-3 backdrop-blur-sm"
      initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true }}
      transition={{ delay: 0.8 + index * 0.1, ...springSmooth }}
      whileHover={{
        borderColor: `${integration.color}20`,
        backgroundColor: "rgba(255,255,255,0.03)",
        y: -2,
      }}
    >
      <div
        className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold"
        style={{
          backgroundColor: `${integration.color}10`,
          color: `${integration.color}80`,
        }}
      >
        {integration.icon}
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-medium text-white/50">
          {integration.name}
        </span>
        <span className="text-[9px] text-white/20">Coming soon</span>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Central Hub — Animated radial visual
   ═══════════════════════════════════════════════════════════════ */
function CentralHubVisual() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {/* Outer breathing ring */}
      <motion.div
        className="absolute h-80 w-80 rounded-full border border-white/3 sm:h-96 sm:w-96 md:h-130 md:w-130"
        animate={{ scale: [1, 1.04, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{
          duration: 6,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Middle dashed ring — rotating */}
      <motion.div
        className="absolute h-60 w-60 rounded-full border border-dashed border-white/4 sm:h-80 sm:w-80 md:h-96 md:w-96"
        animate={{ rotate: [0, 360] }}
        transition={{
          duration: 50,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      >
        <motion.div
          className="absolute -top-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-sky-400/50"
          style={{ boxShadow: "0 0 8px rgba(56,189,248,0.3)" }}
        />
        <motion.div
          className="absolute top-1/2 -right-0.5 h-1 w-1 -translate-y-1/2 rounded-full bg-purple-400/40"
          style={{ boxShadow: "0 0 6px rgba(192,132,252,0.3)" }}
        />
      </motion.div>

      {/* Inner rotating ring */}
      <motion.div
        className="absolute h-40 w-40 rounded-full border border-white/3 sm:h-52 sm:w-52 md:h-64 md:w-64"
        animate={{ rotate: [360, 0] }}
        transition={{
          duration: 40,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      >
        <motion.div
          className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-emerald-400/40"
          style={{ boxShadow: "0 0 6px rgba(52,211,153,0.3)" }}
        />
      </motion.div>

      {/* Core hub node */}
      <motion.div
        className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full border border-sky-400/20 bg-sky-500/5 backdrop-blur-md sm:h-24 sm:w-24"
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 15 }}
      >
        {/* Animated glow */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-full"
          animate={{
            boxShadow: [
              "0 0 20px rgba(56,189,248,0.08), inset 0 0 20px rgba(56,189,248,0.03)",
              "0 0 40px rgba(56,189,248,0.15), inset 0 0 30px rgba(56,189,248,0.06)",
              "0 0 20px rgba(56,189,248,0.08), inset 0 0 20px rgba(56,189,248,0.03)",
            ],
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        {/* Pulse rings */}
        <motion.div
          className="absolute h-full w-full rounded-full border border-sky-400/15"
          animate={{ scale: [1, 1.8, 1.8], opacity: [0.5, 0, 0] }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeOut",
          }}
        />
        <motion.div
          className="absolute h-full w-full rounded-full border border-sky-400/15"
          animate={{ scale: [1, 1.8, 1.8], opacity: [0.5, 0, 0] }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeOut",
            delay: 1,
          }}
        />

        {/* Hub icon */}
        <div className="flex flex-col items-center gap-1">
          <svg
            className="h-6 w-6 text-sky-400 sm:h-7 sm:w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <title>Salesient hub</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.54a4.5 4.5 0 00-1.242-7.244l4.5-4.5a4.5 4.5 0 016.364 6.364l-1.757 1.757"
            />
          </svg>
          <span className="text-[8px] font-bold tracking-[0.15em] text-sky-400/60 uppercase">
            Hub
          </span>
        </div>
      </motion.div>

      {/* Ambient glows */}
      <motion.div
        className="absolute h-64 w-64 rounded-full bg-sky-500/3 blur-3xl sm:h-80 sm:w-80"
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{
          duration: 7,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute h-48 w-48 rounded-full bg-purple-500/3 blur-3xl sm:h-60 sm:w-60"
        animate={{
          scale: [1.1, 0.9, 1.1],
          opacity: [0.2, 0.35, 0.2],
          x: [-15, 15, -15],
        }}
        transition={{
          duration: 9,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Data beam — animated connection line
   ═══════════════════════════════════════════════════════════════ */
function DataBeam({
  color,
  direction,
  delay,
}: {
  color: string;
  direction: "left" | "right";
  delay: number;
}) {
  const isLeft = direction === "left";
  return (
    <motion.div
      className="hidden h-px flex-1 md:block"
      initial={{ scaleX: 0, opacity: 0 }}
      whileInView={{ scaleX: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      style={{ originX: isLeft ? 1 : 0 }}
    >
      <div className="relative h-full w-full overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: isLeft
              ? `linear-gradient(90deg, transparent, ${color}15, ${color}08)`
              : `linear-gradient(90deg, ${color}08, ${color}15, transparent)`,
          }}
        />
        <motion.div
          className="absolute top-0 h-full"
          animate={{
            left: isLeft ? ["120%", "-40%"] : ["-40%", "120%"],
          }}
          transition={{
            duration: 2.2,
            repeat: Number.POSITIVE_INFINITY,
            ease: [0.37, 0, 0.63, 1],
            delay: delay + 0.5,
            repeatDelay: 1.5,
          }}
          style={{
            width: "30%",
            background: `linear-gradient(90deg, transparent, ${color}70, transparent)`,
          }}
        />
        <motion.div
          className="absolute -top-px h-0.5 w-0.5 rounded-full"
          animate={{
            left: isLeft ? ["105%", "-5%"] : ["-5%", "105%"],
          }}
          transition={{
            duration: 2.2,
            repeat: Number.POSITIVE_INFINITY,
            ease: [0.37, 0, 0.63, 1],
            delay: delay + 0.5,
            repeatDelay: 1.5,
          }}
          style={{
            background: color,
            boxShadow: `0 0 6px ${color}, 0 0 12px ${color}50`,
          }}
        />
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Animated counter with intersection observer
   ═══════════════════════════════════════════════════════════════ */
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
            const duration = 1_600;
            const startTime = performance.now();

            const animate = (currentTime: number) => {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
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

/* ═══════════════════════════════════════════════════════════════
   Stats grid with animated counters
   ═══════════════════════════════════════════════════════════════ */
const stats = [
  { value: "50+", label: "Integrations Available", icon: "grid" },
  { value: "99.9%", label: "Uptime Guarantee", icon: "shield" },
  { value: "2min", label: "Average Setup Time", icon: "clock" },
  { value: "10M+", label: "Data Syncs Daily", icon: "pulse" },
];

function StatIcon({ icon, color }: { icon: string; color: string }) {
  const paths: Record<string, React.ReactNode> = {
    grid: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
      />
    ),
    shield: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
      />
    ),
    clock: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
    pulse: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
      />
    ),
  };

  return (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      viewBox="0 0 24 24"
    >
      <title>{icon}</title>
      {paths[icon]}
    </svg>
  );
}

function StatsGrid() {
  return (
    <motion.div
      className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
      variants={gridStagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
    >
      {stats.map((stat, idx) => (
        <motion.div
          key={stat.label}
          className="group relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl border border-white/5 bg-white/2 px-4 py-5 backdrop-blur-sm sm:gap-3 sm:px-6 sm:py-7"
          variants={cardReveal}
          whileHover={{
            borderColor: "rgba(56,189,248,0.12)",
            y: -3,
            backgroundColor: "rgba(255,255,255,0.03)",
          }}
          transition={springSnappy}
        >
          {/* Icon */}
          <motion.div
            className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl border border-sky-400/10 bg-sky-500/5"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{
              delay: 0.6 + idx * 0.12,
              type: "spring",
              stiffness: 350,
              damping: 18,
            }}
          >
            <StatIcon icon={stat.icon} color="rgba(56,189,248,0.6)" />
          </motion.div>

          <span className="font-bold text-2xl tracking-tight text-white/80 sm:text-3xl">
            <AnimatedCounter value={stat.value} />
          </span>

          <span className="text-center text-[11px] font-medium text-white/30 sm:text-xs">
            {stat.label}
          </span>

          {/* Hover shine */}
          <motion.div
            className="pointer-events-none absolute inset-0 -translate-x-full skew-x-12 bg-linear-to-r from-transparent via-white/3 to-transparent group-hover:translate-x-full"
            style={{ transition: "transform 0.8s ease" }}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Floating ambient particles
   ═══════════════════════════════════════════════════════════════ */
function FloatingParticles() {
  const particles = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    size: Math.random() * 2.5 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 10 + 7,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.2 + 0.04,
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
            y: [0, -25, 0],
            x: [0, 8, -8, 0],
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

/* ═══════════════════════════════════════════════════════════════
   Animated divider
   ═══════════════════════════════════════════════════════════════ */
function SectionDivider() {
  return (
    <motion.div
      className="mx-auto flex w-full max-w-xs items-center gap-4"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2, duration: 0.6 }}
    >
      <motion.div
        className="h-px flex-1 bg-linear-to-r from-transparent to-white/8"
        initial={{ scaleX: 0, originX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        className="h-1 w-1 rounded-full bg-sky-400/40"
        animate={{
          boxShadow: [
            "0 0 4px rgba(56,189,248,0.2)",
            "0 0 10px rgba(56,189,248,0.5)",
            "0 0 4px rgba(56,189,248,0.2)",
          ],
        }}
        transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
      />
      <motion.div
        className="h-px flex-1 bg-linear-to-l from-transparent to-white/8"
        initial={{ scaleX: 0, originX: 1 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN EXPORT — Integration Section
   ═══════════════════════════════════════════════════════════════ */
export default function Integration() {
  return (
    <section className="relative flex w-full justify-center overflow-hidden py-20 sm:py-28 md:py-36">
      {/* Dot-grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Edge fade gradients */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-linear-to-b from-black/80 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-black/80 to-transparent" />

      <FloatingParticles />

      <div className="relative z-10 flex w-full max-w-6xl flex-col gap-20 px-4 sm:px-6 md:gap-28">
        {/* ── Section Header ── */}
        <InView className="mx-auto w-fit!">
          <div className="flex flex-col items-center gap-6">
            {/* Badge */}
            <motion.div
              className="flex items-center gap-2.5 rounded-full border border-sky-500/15 bg-sky-500/5 px-5 py-2 backdrop-blur-sm"
              whileHover={{
                scale: 1.05,
                borderColor: "rgba(56,189,248,0.25)",
              }}
              transition={springSnappy}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500" />
              </span>
              <span className="text-[10px] font-bold tracking-[0.25em] text-sky-400/70 uppercase sm:text-xs">
                Integrations
              </span>
            </motion.div>

            {/* Heading */}
            <h2 className="max-w-3xl text-center font-semibold text-4xl leading-[1.08] tracking-tight sm:text-5xl md:text-[3.5rem]">
              <motion.span
                className="inline-block bg-linear-to-b from-white via-white/90 to-white/40 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, ...springSmooth }}
              >
                Your Stack,{" "}
              </motion.span>
              <motion.span
                className="inline-block bg-linear-to-r from-sky-300 via-sky-400 to-sky-600 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, ...springSmooth }}
              >
                Unified.
              </motion.span>
            </h2>

            {/* Subtext */}
            <motion.p
              className="max-w-lg text-center text-base leading-relaxed text-white/40 md:text-lg"
              initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{
                delay: 0.35,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              Connect your existing tools in minutes. One intelligent layer that
              syncs, enriches, and orchestrates your data seamlessly.
            </motion.p>
          </div>
        </InView>

        {/* ── Integration showcase: Hub + Cards ── */}
        <div className="relative">
          {/* Central hub visual — rings & glow (visible on md+) */}
          <div className="pointer-events-none absolute inset-0 hidden items-center justify-center md:flex">
            <CentralHubVisual />
          </div>

          {/* Card grid */}
          <motion.div
            className="relative z-10 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4 lg:gap-6"
            variants={gridStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            {integrationImages.map((image, index) => (
              <IntegrationCard key={image.src} image={image} index={index} />
            ))}
          </motion.div>

          {/* Data beam connectors (desktop) */}
          <div className="pointer-events-none absolute inset-0 hidden items-center md:flex">
            <div className="mx-auto flex w-full max-w-lg items-center justify-between">
              <DataBeam
                color={integrationImages.at(0)?.color ?? "#fff"}
                direction="left"
                delay={1}
              />
              <div className="w-20" />
              <DataBeam
                color={integrationImages.at(3)?.color ?? "#fff"}
                direction="right"
                delay={1.2}
              />
            </div>
          </div>
        </div>

        {/* ── Upcoming integrations ── */}
        <div className="flex flex-col items-center gap-6">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <div className="h-px w-8 bg-linear-to-r from-transparent to-white/8" />
            <span className="text-[10px] font-semibold tracking-[0.25em] text-white/20 uppercase sm:text-xs">
              Coming Soon
            </span>
            <div className="h-px w-8 bg-linear-to-l from-transparent to-white/8" />
          </motion.div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {upcomingIntegrations.map((integration, index) => (
              <UpcomingPill
                key={integration.name}
                integration={integration}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* ── Divider ── */}
        <SectionDivider />

        {/* ── Stats ── */}
        <div className="flex flex-col items-center gap-10">
          <motion.div
            className="flex flex-col items-center gap-3"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, ...springSmooth }}
          >
            <h3 className="text-center font-semibold text-2xl tracking-tight text-white/70 sm:text-3xl">
              Built for Scale
            </h3>
            <p className="max-w-sm text-center text-sm text-white/30">
              Enterprise-grade infrastructure that grows with your team.
            </p>
          </motion.div>

          <StatsGrid />
        </div>

        {/* ── CTA ── */}
        <motion.div
          className="flex flex-col items-center gap-5"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, ...springSmooth }}
        >
          <motion.a
            className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full border border-sky-500/20 bg-sky-500/8 px-7 py-3 font-medium text-sm text-sky-300 backdrop-blur-sm transition-all hover:border-sky-500/30 hover:bg-sky-500/12"
            href="/integration"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            transition={springSnappy}
          >
            {/* Shine sweep */}
            <motion.div
              className="pointer-events-none absolute inset-0 -translate-x-full skew-x-12 bg-linear-to-r from-transparent via-white/6 to-transparent group-hover:translate-x-full"
              style={{ transition: "transform 0.7s ease" }}
            />
            <span className="relative z-10">Explore All Integrations</span>
            <motion.span
              className="relative z-10 inline-block"
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

          <motion.span
            className="text-[11px] text-white/20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            Don&apos;t see your tool?{" "}
            <a
              className="text-sky-400/50 underline decoration-sky-400/20 underline-offset-2 transition-colors hover:text-sky-400/70"
              href="/contact"
            >
              Request an integration
            </a>
          </motion.span>
        </motion.div>
      </div>
    </section>
  );
}
