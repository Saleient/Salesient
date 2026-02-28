"use client";
import Image from "next/image";
import { motion } from "motion/react";
import { InView } from "@/components/ui/in-view";

// Types
type FeatureCardData = {
  id: string;
  title: string;
  description: string;
  bgGradient: string;
  textColor: string;
  imageSrc?: string;
  icon: string;
  accentColor: string;
  accentGlow: string;
};

type ProcessStepData = {
  id: number;
  title: string;
  description: string;
  imageSrc?: string;
  imageAlt: string;
  isReversed?: boolean;
  icon: string;
  accentColor: string;
  mockElements: string[];
};

/* ── Spring configs ── */
const springSmooth = { type: "spring" as const, stiffness: 120, damping: 20 };

// Data
const featureCards: FeatureCardData[] = [
  {
    id: "01",
    title: "Centralized Knowledge Base",
    description:
      "Unify product guides, FAQs, and playbooks in a single source of truth — accessible to your entire team, anywhere, anytime.",
    bgGradient: "from-[#028D35] to-[#2AA437]",
    textColor: "text-white",
    icon: "database",
    accentColor: "#10b981",
    accentGlow: "rgba(16,185,129,0.15)",
  },
  {
    id: "02",
    title: "Distribute Sales-Ready Assets",
    description:
      "Deliver brand-approved decks, pricing sheets, and templates to every representative instantly — always current, always compliant.",
    bgGradient: "bg-white",
    textColor: "text-[#444444]",
    icon: "share",
    accentColor: "#6366f1",
    accentGlow: "rgba(99,102,241,0.15)",
  },
  {
    id: "03",
    title: "Competitive Intelligence",
    description:
      "Access structured insights on competitors, market trends, and win/loss analyses to refine your positioning and sharpen sales strategy.",
    bgGradient: "bg-white",
    textColor: "text-[#444444]",
    icon: "chart",
    accentColor: "#f59e0b",
    accentGlow: "rgba(245,158,11,0.15)",
  },
  {
    id: "04",
    title: "Intelligent Meeting Preparation",
    description:
      "Generate tailored briefing documents with key insights, historical interactions, and personalized talking points before every client engagement.",
    bgGradient: "bg-white",
    textColor: "text-[#444444]",
    icon: "calendar",
    accentColor: "#ec4899",
    accentGlow: "rgba(236,72,153,0.15)",
  },
];

const processSteps: ProcessStepData[] = [
  {
    id: 1,
    title: "Configure Your Workspace",
    description:
      "Define your custom instructions, preferences, and business context so the platform adapts to your organization's unique workflows.",
    imageAlt: "Workspace configuration",
    isReversed: false,
    icon: "settings",
    accentColor: "#6366f1",
    mockElements: [
      "Custom Instructions",
      "Business Context",
      "Team Preferences",
    ],
  },
  {
    id: 2,
    title: "Connect Your Data Sources",
    description:
      "Select the data you want to share, connect your applications, upload documents and links — we handle the rest securely.",
    imageAlt: "Data source connection",
    isReversed: true,
    icon: "plug",
    accentColor: "#10b981",
    mockElements: ["CRM Data", "Documents", "API Connections"],
  },
  {
    id: 3,
    title: "Get Instant Insights",
    description:
      "Ask questions and receive real-time, citation-backed answers drawn from your connected data sources.",
    imageAlt: "Instant insights dashboard",
    isReversed: false,
    icon: "sparkle",
    accentColor: "#f59e0b",
    mockElements: ["AI Analysis", "Citations", "Real-time Answers"],
  },
];

// Icon components
function FeatureIcon({ icon, color }: { icon: string; color: string }) {
  const paths: Record<string, React.ReactNode> = {
    database: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75"
      />
    ),
    share: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
      />
    ),
    chart: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
      />
    ),
    calendar: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
      />
    ),
    settings: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
      />
    ),
    plug: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.54a4.5 4.5 0 00-1.242-7.244l4.5-4.5a4.5 4.5 0 016.364 6.364l-1.757 1.757"
      />
    ),
    sparkle: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
      />
    ),
  };

  return (
    <svg
      className="h-6 w-6"
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{icon}</title>
      {paths[icon]}
    </svg>
  );
}

/* ── Animated mock UI panel for process steps ── */
function ProcessMockUI({ step }: { step: ProcessStepData }) {
  const { icon, accentColor, mockElements } = step;

  return (
    <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl border border-white/6 bg-linear-to-br from-white/3 to-transparent">
      {/* Ambient glow */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 30% 50%, ${accentColor}10, transparent 70%)`,
        }}
      />

      {/* Dot grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Mock window chrome */}
      <motion.div
        className="relative mx-6 w-full max-w-md overflow-hidden rounded-xl border border-white/8 bg-black/60 shadow-2xl backdrop-blur-xl sm:mx-10 md:mx-8 lg:mx-12"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, ...springSmooth }}
      >
        {/* Title bar */}
        <div className="flex items-center gap-2 border-white/6 border-b px-4 py-3">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
            <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
            <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
          </div>
          <div className="ml-3 h-2.5 w-24 rounded-full bg-white/6" />
        </div>

        {/* Content area with animated rows */}
        <div className="space-y-3 p-5">
          {/* Icon header */}
          <motion.div
            className="mb-4 flex items-center gap-3"
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${accentColor}15` }}
            >
              <FeatureIcon color={accentColor} icon={icon} />
            </div>
            <div className="space-y-1.5">
              <div className="h-2.5 w-28 rounded-full bg-white/15" />
              <div className="h-2 w-20 rounded-full bg-white/8" />
            </div>
          </motion.div>

          {/* Animated list items */}
          {mockElements.map((label, idx) => (
            <motion.div
              key={label}
              className="flex items-center gap-3 rounded-lg border border-white/4 bg-white/2 px-3 py-2.5"
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 + idx * 0.15, ...springSmooth }}
            >
              <motion.div
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md"
                style={{ backgroundColor: `${accentColor}20` }}
                animate={{
                  boxShadow: [
                    `0 0 0px ${accentColor}00`,
                    `0 0 8px ${accentColor}30`,
                    `0 0 0px ${accentColor}00`,
                  ],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: idx * 0.5,
                }}
              >
                <div
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: accentColor }}
                />
              </motion.div>
              <span className="text-white/40 text-xs">{label}</span>
              <div className="ml-auto h-1.5 w-12 rounded-full bg-white/6" />
            </motion.div>
          ))}

          {/* Animated progress bar */}
          <motion.div
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1 }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: accentColor }}
              initial={{ width: "0%" }}
              whileInView={{ width: "72%" }}
              viewport={{ once: true }}
              transition={{
                delay: 1.2,
                duration: 1.5,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Floating accent orbs */}
      <motion.div
        className="pointer-events-none absolute right-8 bottom-8 h-32 w-32 rounded-full blur-[60px]"
        style={{ backgroundColor: `${accentColor}08` }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
        transition={{
          duration: 5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

/* ── Animated mock UI panel for feature cards ── */
function FeatureCardMockUI({ card }: { card: FeatureCardData }) {
  const { icon, accentColor, title } = card;

  /* Mock data bars */
  const bars = [85, 62, 93, 48, 76];

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl border border-white/4 bg-linear-to-br from-white/2 to-transparent">
      {/* Ambient glow */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 80%, ${accentColor}08, transparent 70%)`,
        }}
      />

      {/* Mock card content */}
      <motion.div
        className="relative w-full px-5 py-6 sm:px-6 sm:py-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {/* Header row */}
        <motion.div
          className="mb-5 flex items-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${accentColor}12` }}
          >
            <FeatureIcon color={accentColor} icon={icon} />
          </div>
          <div className="space-y-1.5">
            <div className="h-2.5 w-24 rounded-full bg-white/12" />
            <div className="h-2 w-16 rounded-full bg-white/6" />
          </div>
        </motion.div>

        {/* Animated data bars */}
        <div className="space-y-2.5">
          {bars.map((width, idx) => (
            <motion.div
              key={`bar-${title}-${idx}`}
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 + idx * 0.1 }}
            >
              <div className="h-2 w-8 rounded-full bg-white/8" />
              <div className="flex-1 overflow-hidden rounded-full bg-white/4">
                <motion.div
                  className="h-2 rounded-full"
                  style={{
                    backgroundColor: `${accentColor}${idx === 2 ? "90" : "50"}`,
                  }}
                  initial={{ width: "0%" }}
                  whileInView={{ width: `${width}%` }}
                  viewport={{ once: true }}
                  transition={{
                    delay: 0.6 + idx * 0.12,
                    duration: 1.2,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom stats row */}
        <motion.div
          className="mt-5 flex items-center gap-3"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.9 }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={`stat-${title}-${i}`}
              className="flex-1 rounded-lg border border-white/4 bg-white/2 px-3 py-2"
            >
              <div
                className="mb-1 h-3 w-8 rounded"
                style={{ backgroundColor: `${accentColor}25` }}
              />
              <div className="h-1.5 w-12 rounded-full bg-white/6" />
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Floating shimmer */}
      <motion.div
        className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full blur-2xl"
        style={{ backgroundColor: `${accentColor}06` }}
        animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.7, 0.3] }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

// Components
type SectionHeaderProps = {
  badge: string;
  title: string;
  className?: string;
};

function SectionHeader({ badge, title, className = "" }: SectionHeaderProps) {
  return (
    <div
      className={`flex w-full flex-col items-start justify-center gap-6 md:items-center ${className}`}
    >
      <motion.div
        className="w-fit rounded-full border border-white/10 bg-white/3 px-5 py-2 text-sm text-white/40 backdrop-blur-sm"
        whileHover={{ scale: 1.05, borderColor: "rgba(255,255,255,0.2)" }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
      >
        {badge}
      </motion.div>
      <h2 className="text-left font-semibold text-3xl leading-tight tracking-tight sm:max-w-3xl sm:text-center md:font-medium lg:text-5xl">
        <motion.span
          className="bg-linear-to-b from-white to-white/50 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, ...springSmooth }}
        >
          {title}
        </motion.span>
      </h2>
    </div>
  );
}

type WorkflowHeaderProps = {
  badge: string;
  title: string;
  description: string;
};

function WorkflowHeader({ badge, title, description }: WorkflowHeaderProps) {
  return (
    <div className="flex w-full flex-col items-start justify-center gap-6 pb-8 md:items-center md:pb-16">
      <motion.div
        className="w-fit rounded-full border border-white/10 bg-white/3 px-5 py-2 text-sm text-white/40 backdrop-blur-sm"
        whileHover={{ scale: 1.05, borderColor: "rgba(255,255,255,0.2)" }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
      >
        {badge}
      </motion.div>
      <h2 className="max-w-4xl text-left font-semibold text-3xl leading-tight tracking-tight sm:text-center md:font-medium lg:text-5xl">
        <motion.span
          className="bg-linear-to-b from-white to-white/50 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, ...springSmooth }}
        >
          {title}
        </motion.span>
      </h2>
      <motion.p
        className="max-w-2xl text-left text-base text-white/50 leading-relaxed sm:text-center sm:text-lg"
        initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true }}
        transition={{ delay: 0.25, duration: 0.6 }}
      >
        {description}
      </motion.p>
    </div>
  );
}

type ProcessStepProps = {
  step: ProcessStepData;
};

function ProcessStep({ step }: ProcessStepProps) {
  const { id, title, description, imageSrc, imageAlt, isReversed } = step;

  const imageSection = (
    <div className="rounded-2xl md:min-h-96 lg:min-h-112 xl:min-h-128">
      {imageSrc ? (
        <Image
          alt={imageAlt}
          className="aspect-video h-full w-full rounded-2xl object-cover object-center"
          height={900}
          src={imageSrc}
          width={1600}
        />
      ) : (
        <ProcessMockUI step={step} />
      )}
    </div>
  );

  const contentSection = (
    <div className="flex flex-col justify-center px-6 py-8 md:px-10 md:py-12 lg:px-12 lg:py-16">
      <motion.div
        className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl md:mb-6"
        style={{ backgroundColor: `${step.accentColor}12` }}
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
      >
        <FeatureIcon color={step.accentColor} icon={step.icon} />
      </motion.div>
      <motion.h3
        className="mb-4 font-semibold text-white text-xl md:mb-6 md:text-3xl lg:text-4xl"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, ...springSmooth }}
      >
        {id}. {title}
      </motion.h3>
      <motion.p
        className="text-base text-white/50 leading-relaxed md:text-lg"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        {description}
      </motion.p>
    </div>
  );

  return (
    <motion.div
      className="group relative flex flex-col overflow-clip rounded-xl border border-white/6 bg-[#0a0a0a] p-6 transition-colors duration-300 hover:border-white/10 md:grid md:grid-cols-2 md:gap-8 md:rounded-2xl md:border-white/4 md:bg-linear-to-br md:from-white/2 md:to-transparent md:p-0 lg:gap-12"
      whileHover={{ borderColor: "rgba(255,255,255,0.08)" }}
    >
      <div className="md:hidden">
        {imageSection}
        {contentSection}
      </div>
      <div className="hidden md:contents">
        {isReversed ? (
          <>
            {contentSection}
            {imageSection}
          </>
        ) : (
          <>
            {imageSection}
            {contentSection}
          </>
        )}
      </div>
    </motion.div>
  );
}

type FeatureCardProps = {
  card: FeatureCardData;
};

function FeatureCard({ card }: FeatureCardProps) {
  const { title, description, imageSrc, accentColor, accentGlow } = card;

  return (
    <motion.div
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/6 bg-[#0a0a0a] p-6 transition-colors duration-300 hover:border-white/12"
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {/* Hover glow overlay */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${accentGlow}, transparent 70%)`,
        }}
      />

      <div className="relative mb-6 aspect-video max-h-128">
        {imageSrc ? (
          <Image
            alt={title}
            className="h-full w-full rounded-xl object-cover"
            height={900}
            src={imageSrc}
            width={1600}
          />
        ) : (
          <FeatureCardMockUI card={card} />
        )}
      </div>

      <motion.h3
        className="relative mb-4 font-semibold text-2xl text-white md:text-3xl"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.15, ...springSmooth }}
      >
        {title}
      </motion.h3>

      <motion.p
        className="relative text-base text-white/50 leading-relaxed"
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.25, duration: 0.5 }}
      >
        {description}
      </motion.p>

      {/* Bottom accent line */}
      <motion.div
        className="absolute inset-x-0 bottom-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${accentColor}40, transparent)`,
        }}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.8 }}
      />
    </motion.div>
  );
}

type ProcessSectionProps = {
  steps: ProcessStepData[];
};

function ProcessSection({ steps }: ProcessSectionProps) {
  return (
    <div className="mx-auto flex w-full max-w-360 flex-col items-center justify-center">
      <InView transition={{ duration: 0.5, delay: 0 }}>
        <SectionHeader
          badge="How It Works"
          className="mb-12 md:mb-20"
          title="Surface insights from every corner of your organization"
        />
      </InView>

      <div className="grid w-full gap-12 text-white md:grid-cols-1 md:gap-16 lg:gap-20">
        {steps.map((step, idx) => (
          <InView
            key={step.id}
            transition={{ duration: 0.6, delay: idx * 0.2 }}
          >
            <ProcessStep step={step} />
          </InView>
        ))}
      </div>
    </div>
  );
}

type WorkflowSectionProps = {
  cards: FeatureCardData[];
};

function WorkflowSection({ cards }: WorkflowSectionProps) {
  return (
    <div className="mx-auto flex w-full max-w-360 flex-col items-center justify-center">
      <InView transition={{ duration: 0.5, delay: 0 }}>
        <WorkflowHeader
          badge="Capabilities"
          description="A comprehensive toolchain that elevates the entire sales document lifecycle — from content creation to polished delivery."
          title="Elevate Your Sales Document Workflow"
        />
      </InView>

      <div className="grid w-full grid-cols-1 gap-8 sm:grid-cols-2 md:gap-12 lg:gap-16">
        {cards.map((card, idx) => (
          <InView
            key={card.id}
            transition={{ duration: 0.6, delay: idx * 0.15 }}
          >
            <FeatureCard card={card} />
          </InView>
        ))}
      </div>
    </div>
  );
}

// Main Component
export default function Features() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center gap-20 bg-black px-5 py-20 sm:px-8 md:gap-40 md:px-12 md:py-32">
      {/* Subtle background pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Process section */}
      <div className="relative w-full py-8">
        <ProcessSection steps={processSteps} />
      </div>

      {/* Animated divider */}
      <motion.div
        className="relative w-full max-w-360"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="h-px w-full bg-linear-to-r from-transparent via-white/10 to-transparent" />
      </motion.div>

      <WorkflowSection cards={featureCards} />
    </section>
  );
}
