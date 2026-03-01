"use client";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
  useInView,
} from "motion/react";
import { InView } from "@/components/ui/in-view";
import { useCallback, useRef, type MouseEvent as ReactMouseEvent } from "react";

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
const springSnappy = { type: "spring" as const, stiffness: 400, damping: 30 };

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

/* ── Floating particles for ambient depth ── */
function FeatureParticles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    size: Math.random() * 2 + 0.8,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 12 + 10,
    delay: Math.random() * 6,
    opacity: Math.random() * 0.12 + 0.03,
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
            y: [0, -30, 0],
            x: [0, Math.random() * 10 - 5, 0],
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

// Icon components
function FeatureIcon({
  icon,
  color,
  size = 6,
}: {
  icon: string;
  color: string;
  size?: number;
}) {
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
      className={`h-${size} w-${size}`}
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

/* ── Animated gradient border wrapper ── */
function GradientBorderCard({
  children,
  accentColor,
  className = "",
}: {
  children: React.ReactNode;
  accentColor: string;
  className?: string;
}) {
  return (
    <div className={`group relative ${className}`}>
      {/* Animated gradient border */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-700 group-hover:opacity-100"
        style={{
          background: `linear-gradient(135deg, ${accentColor}30, transparent 40%, transparent 60%, ${accentColor}20)`,
        }}
      />
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 blur-sm transition-opacity duration-700 group-hover:opacity-60"
        style={{
          background: `linear-gradient(135deg, ${accentColor}15, transparent 50%, ${accentColor}10)`,
        }}
      />
      {children}
    </div>
  );
}

/* ── Window chrome (reusable title bar) ── */
function WindowChrome({ accentColor }: { accentColor: string }) {
  return (
    <div className="flex items-center gap-2 border-white/6 border-b px-4 py-3">
      <div className="flex gap-1.5">
        <motion.div
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: "#ff5f57" }}
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, type: "spring", stiffness: 500 }}
        />
        <motion.div
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: "#febc2e" }}
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, type: "spring", stiffness: 500 }}
        />
        <motion.div
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: "#28c840" }}
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7, type: "spring", stiffness: 500 }}
        />
      </div>
      <motion.div
        className="ml-3 h-2.5 rounded-full bg-white/6"
        initial={{ width: 0 }}
        whileInView={{ width: 96 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8, duration: 0.6 }}
      />
    </div>
  );
}

/* ── Step 1: Configure Workspace — Settings panel with toggles ── */
function ConfigureWorkspaceMock({ accentColor }: { accentColor: string }) {
  const settings = [
    { label: "Company Name", value: "Acme Corp", type: "input" as const },
    { label: "AI Tone", value: "Professional", type: "select" as const },
    { label: "Auto-suggestions", value: true, type: "toggle" as const },
    { label: "Citation Mode", value: true, type: "toggle" as const },
  ];

  return (
    <div className="space-y-3 p-5">
      {/* Section title */}
      <motion.div
        className="mb-4 flex items-center gap-2"
        initial={{ opacity: 0, y: -8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
      >
        <div
          className="flex h-7 w-7 items-center justify-center rounded-md"
          style={{ backgroundColor: `${accentColor}15` }}
        >
          <FeatureIcon color={accentColor} icon="settings" size={4} />
        </div>
        <span className="text-white/50 text-xs font-medium tracking-wide uppercase">
          Workspace Settings
        </span>
      </motion.div>

      {settings.map((setting, idx) => (
        <motion.div
          key={setting.label}
          className="flex items-center justify-between rounded-lg border border-white/4 bg-white/2 px-3.5 py-2.5"
          initial={{ opacity: 0, x: -16, filter: "blur(3px)" }}
          whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 + idx * 0.12, ...springSmooth }}
        >
          <span className="text-white/35 text-xs">{setting.label}</span>
          {setting.type === "toggle" ? (
            <motion.div
              className="flex h-5 w-9 items-center rounded-full px-0.5"
              style={{
                backgroundColor: setting.value
                  ? `${accentColor}40`
                  : "rgba(255,255,255,0.08)",
              }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 + idx * 0.1 }}
            >
              <motion.div
                className="h-3.5 w-3.5 rounded-full bg-white shadow-sm"
                initial={{ x: 0 }}
                whileInView={{ x: setting.value ? 16 : 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: 1 + idx * 0.1,
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                }}
              />
            </motion.div>
          ) : setting.type === "select" ? (
            <motion.div
              className="flex items-center gap-1 rounded-md border border-white/6 bg-white/3 px-2 py-1"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.9 + idx * 0.1 }}
            >
              <span className="text-white/50 text-[10px]">{setting.value}</span>
              <svg
                className="h-2.5 w-2.5 text-white/25"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <title>Dropdown</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </motion.div>
          ) : (
            <motion.div
              className="rounded-md border border-white/6 bg-white/3 px-2.5 py-1"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.9 + idx * 0.1 }}
            >
              <span className="text-white/50 text-[10px]">{setting.value}</span>
            </motion.div>
          )}
        </motion.div>
      ))}

      {/* Save button */}
      <motion.div
        className="mt-2 flex justify-end"
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 1.2 }}
      >
        <motion.div
          className="rounded-lg px-4 py-1.5"
          style={{ backgroundColor: `${accentColor}25` }}
          animate={{
            boxShadow: [
              `0 0 0px ${accentColor}00`,
              `0 0 12px ${accentColor}15`,
              `0 0 0px ${accentColor}00`,
            ],
          }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
        >
          <span
            className="text-[10px] font-medium"
            style={{ color: accentColor }}
          >
            Save Changes
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ── Step 2: Connect Data Sources — Integration nodes with connection lines ── */
function ConnectDataSourcesMock({ accentColor }: { accentColor: string }) {
  const integrations = [
    { name: "Salesforce", initials: "SF", color: "#00A1E0", connected: true },
    { name: "HubSpot", initials: "HS", color: "#FF7A59", connected: true },
    {
      name: "Google Drive",
      initials: "GD",
      color: "#4285F4",
      connected: false,
    },
  ];

  return (
    <div className="space-y-3 p-5">
      {/* Header */}
      <motion.div
        className="mb-3 flex items-center justify-between"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-md"
            style={{ backgroundColor: `${accentColor}15` }}
          >
            <FeatureIcon color={accentColor} icon="plug" size={4} />
          </div>
          <span className="text-white/50 text-xs font-medium tracking-wide uppercase">
            Integrations
          </span>
        </div>
        <motion.span
          className="rounded-full px-2 py-0.5 text-[9px] font-medium"
          style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, type: "spring", stiffness: 400 }}
        >
          2 of 3 connected
        </motion.span>
      </motion.div>

      {/* Integration cards */}
      {integrations.map((app, idx) => (
        <motion.div
          key={app.name}
          className="flex items-center gap-3 rounded-lg border border-white/4 bg-white/2 px-3.5 py-3"
          initial={{ opacity: 0, x: -20, filter: "blur(3px)" }}
          whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 + idx * 0.15, ...springSmooth }}
        >
          {/* App icon */}
          <motion.div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white"
            style={{ backgroundColor: app.color }}
            initial={{ scale: 0.5, rotate: -10 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{
              delay: 0.7 + idx * 0.15,
              type: "spring",
              stiffness: 400,
            }}
          >
            {app.initials}
          </motion.div>

          <div className="flex flex-1 flex-col">
            <span className="text-white/50 text-xs font-medium">
              {app.name}
            </span>
            <span className="text-white/20 text-[10px]">
              {app.connected ? "Syncing data..." : "Not connected"}
            </span>
          </div>

          {/* Status indicator */}
          {app.connected ? (
            <motion.div
              className="flex items-center gap-1.5 rounded-full border px-2 py-0.5"
              style={{
                borderColor: `${accentColor}30`,
                backgroundColor: `${accentColor}08`,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.9 + idx * 0.1 }}
            >
              <motion.div
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: accentColor }}
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: idx * 0.3,
                }}
              />
              <span
                className="text-[9px] font-medium"
                style={{ color: accentColor }}
              >
                Live
              </span>
            </motion.div>
          ) : (
            <motion.div
              className="rounded-md border border-white/8 bg-white/4 px-2 py-0.5"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1 + idx * 0.1 }}
            >
              <span className="text-white/30 text-[9px]">Connect</span>
            </motion.div>
          )}
        </motion.div>
      ))}

      {/* Connection status bar */}
      <motion.div
        className="mt-2 flex items-center gap-2"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1.2 }}
      >
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/5">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${accentColor}, ${accentColor}60)`,
            }}
            initial={{ width: "0%" }}
            whileInView={{ width: "67%" }}
            viewport={{ once: true }}
            transition={{ delay: 1.4, duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <span className="text-white/20 text-[9px]">67%</span>
      </motion.div>
    </div>
  );
}

/* ── Step 3: Get Instant Insights — AI chat interface ── */
function InsightsChatMock({ accentColor }: { accentColor: string }) {
  return (
    <div className="flex flex-col p-5">
      {/* User message */}
      <motion.div
        className="mb-3 ml-auto max-w-[80%] rounded-xl rounded-br-sm border border-white/6 bg-white/4 px-3.5 py-2.5"
        initial={{ opacity: 0, y: 12, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, ...springSmooth }}
      >
        <span className="text-white/50 text-[11px] leading-relaxed">
          What were our top competitors&apos; pricing changes last quarter?
        </span>
      </motion.div>

      {/* AI response */}
      <motion.div
        className="mb-3 max-w-[90%] space-y-2 rounded-xl rounded-bl-sm border border-white/6 bg-white/2 px-3.5 py-3"
        initial={{ opacity: 0, y: 12, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8, ...springSmooth }}
      >
        {/* AI icon */}
        <div className="mb-2 flex items-center gap-2">
          <motion.div
            className="flex h-5 w-5 items-center justify-center rounded-md"
            style={{ backgroundColor: `${accentColor}20` }}
            animate={{
              boxShadow: [
                `0 0 0px ${accentColor}00`,
                `0 0 8px ${accentColor}25`,
                `0 0 0px ${accentColor}00`,
              ],
            }}
            transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY }}
          >
            <FeatureIcon color={accentColor} icon="sparkle" size={3} />
          </motion.div>
          <span className="text-white/30 text-[9px] font-medium uppercase tracking-wider">
            Salesient AI
          </span>
        </div>

        {/* Typed response lines */}
        {[
          "Based on 3 sources, CompetitorA raised",
          "enterprise pricing by 12% while CompetitorB",
          "introduced a new freemium tier...",
        ].map((line, idx) => (
          <motion.div
            key={`line-${idx}`}
            className="text-white/40 text-[11px] leading-relaxed"
            initial={{ opacity: 0, filter: "blur(2px)" }}
            whileInView={{ opacity: 1, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ delay: 1 + idx * 0.2, duration: 0.4 }}
          >
            {line}
          </motion.div>
        ))}

        {/* Citation tags */}
        <motion.div
          className="mt-2 flex flex-wrap gap-1.5"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.7 }}
        >
          {["Q3 Report", "Market Analysis", "Pricing DB"].map((source, idx) => (
            <motion.span
              key={source}
              className="rounded-md border px-1.5 py-0.5 text-[8px] font-medium"
              style={{
                borderColor: `${accentColor}25`,
                color: `${accentColor}`,
                backgroundColor: `${accentColor}08`,
              }}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{
                delay: 1.8 + idx * 0.1,
                type: "spring",
                stiffness: 400,
              }}
            >
              {source}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>

      {/* Input bar */}
      <motion.div
        className="flex items-center gap-2 rounded-lg border border-white/6 bg-white/2 px-3 py-2"
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 2 }}
      >
        <span className="flex-1 text-white/15 text-[10px]">
          Ask a follow-up question...
        </span>
        <motion.div
          className="flex h-5 w-5 items-center justify-center rounded-md"
          style={{ backgroundColor: `${accentColor}30` }}
          animate={{
            boxShadow: [
              `0 0 0px ${accentColor}00`,
              `0 0 6px ${accentColor}20`,
              `0 0 0px ${accentColor}00`,
            ],
          }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          <svg
            className="h-2.5 w-2.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke={accentColor}
            strokeWidth={2.5}
          >
            <title>Send</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18"
            />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ── Process step mock UI router — renders the right mock for each step ── */
function ProcessMockUI({ step }: { step: ProcessStepData }) {
  const { accentColor } = step;

  const contentByStep: Record<number, React.ReactNode> = {
    1: <ConfigureWorkspaceMock accentColor={accentColor} />,
    2: <ConnectDataSourcesMock accentColor={accentColor} />,
    3: <InsightsChatMock accentColor={accentColor} />,
  };

  return (
    <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl border border-white/6 bg-linear-to-br from-white/3 to-transparent">
      {/* Ambient glow */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 30% 50%, ${accentColor}10, transparent 70%)`,
        }}
        animate={{
          background: [
            `radial-gradient(ellipse at 30% 50%, ${accentColor}10, transparent 70%)`,
            `radial-gradient(ellipse at 60% 40%, ${accentColor}12, transparent 70%)`,
            `radial-gradient(ellipse at 30% 50%, ${accentColor}10, transparent 70%)`,
          ],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Window */}
      <motion.div
        className="relative mx-6 w-full max-w-md overflow-hidden rounded-xl border border-white/8 bg-black/60 shadow-2xl backdrop-blur-xl sm:mx-10 md:mx-8 lg:mx-12"
        initial={{ opacity: 0, y: 30, scale: 0.92 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, ...springSmooth }}
      >
        <WindowChrome accentColor={accentColor} />
        {contentByStep[step.id]}
      </motion.div>

      {/* Accent orb */}
      <motion.div
        className="pointer-events-none absolute right-8 bottom-8 h-28 w-28 rounded-full blur-3xl"
        style={{ backgroundColor: `${accentColor}08` }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{
          duration: 6,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

/* ── Knowledge Base card mock — document library with search ── */
function KnowledgeBaseMock({ accentColor }: { accentColor: string }) {
  const docs = [
    { name: "Product Playbook", type: "PDF", pages: 24 },
    { name: "Enterprise FAQ", type: "DOC", pages: 12 },
    { name: "Onboarding Guide", type: "PDF", pages: 18 },
    { name: "API Reference", type: "MD", pages: 45 },
  ];

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-xl border border-white/4 bg-linear-to-br from-white/2 to-transparent p-4 sm:p-5">
      {/* Search bar */}
      <motion.div
        className="mb-3 flex items-center gap-2 rounded-lg border border-white/6 bg-white/3 px-3 py-2"
        initial={{ opacity: 0, y: -8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
      >
        <svg
          className="h-3.5 w-3.5 text-white/20"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <title>Search</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <span className="text-white/15 text-[10px]">
          Search knowledge base...
        </span>
      </motion.div>

      {/* Document list */}
      <div className="space-y-2">
        {docs.map((doc, idx) => (
          <motion.div
            key={doc.name}
            className="flex items-center gap-2.5 rounded-lg border border-white/4 bg-white/2 px-3 py-2"
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 + idx * 0.1, ...springSmooth }}
          >
            {/* File icon */}
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[8px] font-bold"
              style={{
                backgroundColor: `${accentColor}15`,
                color: accentColor,
              }}
            >
              {doc.type}
            </div>
            <div className="flex-1">
              <span className="text-white/45 text-[11px] font-medium">
                {doc.name}
              </span>
              <div className="text-white/15 text-[9px]">{doc.pages} pages</div>
            </div>
            <motion.div
              className="h-1 w-6 rounded-full"
              style={{ backgroundColor: `${accentColor}30` }}
              initial={{ width: 0 }}
              whileInView={{ width: 24 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 + idx * 0.1, duration: 0.4 }}
            />
          </motion.div>
        ))}
      </div>

      {/* Stats row */}
      <motion.div
        className="mt-auto flex items-center gap-3 pt-3"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.9 }}
      >
        <span className="text-white/15 text-[9px]">128 documents</span>
        <div className="h-2.5 w-px bg-white/6" />
        <span className="text-white/15 text-[9px]">Last updated 2h ago</span>
      </motion.div>

      {/* Ambient glow */}
      <motion.div
        className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full blur-2xl"
        style={{ backgroundColor: `${accentColor}06` }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{
          duration: 5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

/* ── Sales Assets card mock — asset distribution grid ── */
function SalesAssetsMock({ accentColor }: { accentColor: string }) {
  const assets = [
    { name: "Q4 Pricing Deck", status: "Approved", updatedAgo: "1d" },
    { name: "Case Study: Fintech", status: "Approved", updatedAgo: "3d" },
    { name: "ROI Calculator", status: "Draft", updatedAgo: "5h" },
  ];

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-xl border border-white/4 bg-linear-to-br from-white/2 to-transparent p-4 sm:p-5">
      {/* Header */}
      <motion.div
        className="mb-3 flex items-center justify-between"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
      >
        <span className="text-white/40 text-[10px] font-medium uppercase tracking-wider">
          Active Assets
        </span>
        <motion.span
          className="rounded-full px-2 py-0.5 text-[8px] font-bold"
          style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, type: "spring", stiffness: 400 }}
        >
          3 items
        </motion.span>
      </motion.div>

      {/* Asset cards */}
      {assets.map((asset, idx) => (
        <motion.div
          key={asset.name}
          className="mb-2 flex items-center gap-3 rounded-lg border border-white/4 bg-white/2 px-3 py-2.5"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 + idx * 0.12, ...springSmooth }}
        >
          {/* Thumbnail placeholder */}
          <motion.div
            className="flex h-9 w-12 shrink-0 items-center justify-center rounded-md border border-white/6"
            style={{ backgroundColor: `${accentColor}08` }}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke={accentColor}
              strokeWidth={1.5}
            >
              <title>Document</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          </motion.div>

          <div className="flex-1">
            <span className="text-white/45 text-[11px] font-medium">
              {asset.name}
            </span>
            <div className="mt-0.5 flex items-center gap-2">
              <span
                className="rounded-sm px-1 py-px text-[7px] font-bold uppercase"
                style={{
                  backgroundColor:
                    asset.status === "Approved"
                      ? `${accentColor}15`
                      : "rgba(255,255,255,0.06)",
                  color:
                    asset.status === "Approved"
                      ? accentColor
                      : "rgba(255,255,255,0.3)",
                }}
              >
                {asset.status}
              </span>
              <span className="text-white/15 text-[8px]">
                {asset.updatedAgo} ago
              </span>
            </div>
          </div>

          {/* Share icon */}
          <motion.div
            className="flex h-6 w-6 items-center justify-center rounded-md border border-white/6"
            whileHover={{ borderColor: `${accentColor}30` }}
          >
            <svg
              className="h-3 w-3 text-white/25"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <title>Share</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
          </motion.div>
        </motion.div>
      ))}

      {/* Distribution bar */}
      <motion.div
        className="mt-auto flex items-center gap-2 pt-2"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1 }}
      >
        <span className="text-white/15 text-[9px]">Distributed to</span>
        <div className="flex -space-x-1">
          {["#6366f1", "#ec4899", "#f59e0b", "#10b981"].map((c, i) => (
            <motion.div
              key={`avatar-${c}`}
              className="h-4 w-4 rounded-full border border-[#060606]"
              style={{ backgroundColor: `${c}40` }}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{
                delay: 1.1 + i * 0.08,
                type: "spring",
                stiffness: 500,
              }}
            />
          ))}
        </div>
        <span className="text-white/15 text-[9px]">+12 reps</span>
      </motion.div>

      <motion.div
        className="pointer-events-none absolute -right-4 -bottom-4 h-20 w-20 rounded-full blur-2xl"
        style={{ backgroundColor: `${accentColor}06` }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{
          duration: 5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

/* ── Competitive Intelligence card mock — comparison matrix ── */
function CompetitiveIntelMock({ accentColor }: { accentColor: string }) {
  const competitors = [
    { name: "You", scores: [95, 88, 92] },
    { name: "Comp A", scores: [72, 80, 65] },
    { name: "Comp B", scores: [68, 75, 78] },
  ];
  const metrics = ["Features", "Pricing", "Support"];

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-xl border border-white/4 bg-linear-to-br from-white/2 to-transparent p-4 sm:p-5">
      {/* Header */}
      <motion.div
        className="mb-3 flex items-center gap-2"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
      >
        <div
          className="flex h-6 w-6 items-center justify-center rounded-md"
          style={{ backgroundColor: `${accentColor}15` }}
        >
          <FeatureIcon color={accentColor} icon="chart" size={3} />
        </div>
        <span className="text-white/40 text-[10px] font-medium uppercase tracking-wider">
          Market Position
        </span>
      </motion.div>

      {/* Comparison table header */}
      <motion.div
        className="mb-2 grid grid-cols-4 gap-1 px-1"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
      >
        <div />
        {metrics.map((m) => (
          <span
            key={m}
            className="text-center text-white/20 text-[8px] uppercase tracking-wider"
          >
            {m}
          </span>
        ))}
      </motion.div>

      {/* Rows */}
      {competitors.map((comp, idx) => (
        <motion.div
          key={comp.name}
          className="mb-1.5 grid grid-cols-4 items-center gap-1 rounded-lg border border-white/4 bg-white/2 px-2.5 py-2"
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 + idx * 0.12, ...springSmooth }}
          style={
            idx === 0
              ? {
                  borderColor: `${accentColor}20`,
                  backgroundColor: `${accentColor}05`,
                }
              : undefined
          }
        >
          <span
            className="text-[10px] font-medium"
            style={{
              color: idx === 0 ? accentColor : "rgba(255,255,255,0.35)",
            }}
          >
            {comp.name}
          </span>
          {comp.scores.map((score, sIdx) => (
            <motion.div
              key={`score-${comp.name}-${sIdx}`}
              className="flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                delay: 0.7 + idx * 0.1 + sIdx * 0.08,
                type: "spring",
                stiffness: 300,
              }}
            >
              <span
                className="rounded-md px-1.5 py-0.5 text-[9px] font-bold"
                style={{
                  backgroundColor:
                    idx === 0 ? `${accentColor}20` : "rgba(255,255,255,0.04)",
                  color: idx === 0 ? accentColor : "rgba(255,255,255,0.3)",
                }}
              >
                {score}
              </span>
            </motion.div>
          ))}
        </motion.div>
      ))}

      {/* Trend indicator */}
      <motion.div
        className="mt-auto flex items-center gap-2 pt-2"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1.1 }}
      >
        <svg
          className="h-3 w-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke={accentColor}
          strokeWidth={2}
        >
          <title>Trending up</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-.94m5.94.94l-.94 5.94"
          />
        </svg>
        <span className="text-[9px] font-medium" style={{ color: accentColor }}>
          +8% win rate this quarter
        </span>
      </motion.div>

      <motion.div
        className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full blur-2xl"
        style={{ backgroundColor: `${accentColor}06` }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{
          duration: 5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

/* ── Meeting Preparation card mock — briefing document ── */
function MeetingPrepMock({ accentColor }: { accentColor: string }) {
  const talkingPoints = [
    "Discuss Q4 renewal pricing",
    "Address support escalation from Oct",
    "Present new enterprise tier benefits",
  ];

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-xl border border-white/4 bg-linear-to-br from-white/2 to-transparent p-4 sm:p-5">
      {/* Meeting header */}
      <motion.div
        className="mb-3 rounded-lg border border-white/6 bg-white/3 px-3 py-2.5"
        initial={{ opacity: 0, y: -8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <span className="text-white/50 text-[11px] font-medium">
            Acme Corp — Q4 Review
          </span>
          <span className="text-white/20 text-[9px]">Today, 2:00 PM</span>
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <div className="flex -space-x-1">
            {["#6366f1", "#ec4899", "#f59e0b"].map((c) => (
              <motion.div
                key={`attendee-${c}`}
                className="h-4 w-4 rounded-full border border-[#060606]"
                style={{ backgroundColor: `${c}50` }}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, type: "spring", stiffness: 400 }}
              />
            ))}
          </div>
          <span className="text-white/15 text-[8px]">3 attendees</span>
        </div>
      </motion.div>

      {/* AI-generated talking points */}
      <motion.div
        className="mb-2 flex items-center gap-1.5"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
      >
        <motion.div
          className="flex h-4 w-4 items-center justify-center rounded-sm"
          style={{ backgroundColor: `${accentColor}15` }}
          animate={{
            boxShadow: [
              `0 0 0px ${accentColor}00`,
              `0 0 6px ${accentColor}20`,
              `0 0 0px ${accentColor}00`,
            ],
          }}
          transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY }}
        >
          <FeatureIcon color={accentColor} icon="sparkle" size={2} />
        </motion.div>
        <span
          className="text-[9px] font-medium"
          style={{ color: `${accentColor}90` }}
        >
          AI-Generated Briefing
        </span>
      </motion.div>

      <div className="space-y-1.5">
        {talkingPoints.map((point, idx) => (
          <motion.div
            key={`tp-${idx}`}
            className="flex items-start gap-2 rounded-md border border-white/4 bg-white/2 px-2.5 py-2"
            initial={{ opacity: 0, x: -10, filter: "blur(2px)" }}
            whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 + idx * 0.15, ...springSmooth }}
          >
            <motion.div
              className="mt-0.5 h-3 w-3 shrink-0 rounded-sm border"
              style={{ borderColor: `${accentColor}30` }}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{
                delay: 0.8 + idx * 0.1,
                type: "spring",
                stiffness: 400,
              }}
            />
            <span className="text-white/40 text-[10px] leading-relaxed">
              {point}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Context badge */}
      <motion.div
        className="mt-auto flex items-center gap-2 pt-3"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1.2 }}
      >
        <span className="text-white/15 text-[9px]">Based on</span>
        {["CRM History", "Past Emails"].map((src) => (
          <span
            key={src}
            className="rounded-md border px-1.5 py-0.5 text-[7px] font-medium"
            style={{
              borderColor: `${accentColor}20`,
              color: `${accentColor}80`,
              backgroundColor: `${accentColor}06`,
            }}
          >
            {src}
          </span>
        ))}
      </motion.div>

      <motion.div
        className="pointer-events-none absolute -left-4 -bottom-4 h-20 w-20 rounded-full blur-2xl"
        style={{ backgroundColor: `${accentColor}06` }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{
          duration: 5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

/* ── Feature card mock UI router — renders the right visual for each card ── */
function FeatureCardMockUI({ card }: { card: FeatureCardData }) {
  const mockByIcon: Record<string, React.ReactNode> = {
    database: <KnowledgeBaseMock accentColor={card.accentColor} />,
    share: <SalesAssetsMock accentColor={card.accentColor} />,
    chart: <CompetitiveIntelMock accentColor={card.accentColor} />,
    calendar: <MeetingPrepMock accentColor={card.accentColor} />,
  };

  return mockByIcon[card.icon] ?? null;
}

// Components
type SectionHeaderProps = {
  badge: string;
  title: string;
  subtitle?: string;
  className?: string;
};

function SectionHeader({
  badge,
  title,
  subtitle,
  className = "",
}: SectionHeaderProps) {
  return (
    <div
      className={`flex w-full flex-col items-start justify-center gap-6 md:items-center ${className}`}
    >
      <motion.div
        className="group/badge relative w-fit cursor-default overflow-hidden rounded-full border border-white/10 bg-white/3 px-5 py-2 text-sm text-white/50 backdrop-blur-sm"
        whileHover={{ scale: 1.05, borderColor: "rgba(255,255,255,0.2)" }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
      >
        {/* Shimmer sweep on badge */}
        <motion.div
          className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/8 to-transparent"
          animate={{ translateX: ["-100%", "200%"] }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            repeatDelay: 4,
          }}
        />
        <span className="relative">{badge}</span>
      </motion.div>
      <h2 className="text-left font-semibold text-3xl leading-tight tracking-tight sm:max-w-3xl sm:text-center md:font-medium lg:text-5xl">
        <motion.span
          className="bg-linear-to-b from-white to-white/50 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, ...springSmooth }}
        >
          {title}
        </motion.span>
      </h2>
      {subtitle ? (
        <motion.p
          className="max-w-2xl text-left text-base text-white/40 leading-relaxed sm:text-center sm:text-lg"
          initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ delay: 0.25, duration: 0.6 }}
        >
          {subtitle}
        </motion.p>
      ) : null}
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
        className="group/badge relative w-fit cursor-default overflow-hidden rounded-full border border-white/10 bg-white/3 px-5 py-2 text-sm text-white/50 backdrop-blur-sm"
        whileHover={{ scale: 1.05, borderColor: "rgba(255,255,255,0.2)" }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
      >
        <motion.div
          className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/8 to-transparent"
          animate={{ translateX: ["-100%", "200%"] }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            repeatDelay: 5,
          }}
        />
        <span className="relative">{badge}</span>
      </motion.div>
      <h2 className="max-w-4xl text-left font-semibold text-3xl leading-tight tracking-tight sm:text-center md:font-medium lg:text-5xl">
        <motion.span
          className="bg-linear-to-b from-white to-white/50 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, ...springSmooth }}
        >
          {title}
        </motion.span>
      </h2>
      <motion.p
        className="max-w-2xl text-left text-base text-white/40 leading-relaxed sm:text-center sm:text-lg"
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

/* ── Step number with animated ring ── */
function StepNumber({
  num,
  accentColor,
}: {
  num: number;
  accentColor: string;
}) {
  return (
    <motion.div
      className="relative flex h-14 w-14 items-center justify-center md:h-16 md:w-16"
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Animated ring */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 64 64">
        <title>Step {num}</title>
        <motion.circle
          cx="32"
          cy="32"
          r="28"
          fill="none"
          stroke={`${accentColor}20`}
          strokeWidth="1.5"
        />
        <motion.circle
          cx="32"
          cy="32"
          r="28"
          fill="none"
          stroke={accentColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="176"
          initial={{ strokeDashoffset: 176 }}
          whileInView={{ strokeDashoffset: 44 }}
          viewport={{ once: true }}
          transition={{
            delay: 0.4,
            duration: 1.5,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      </svg>
      <span className="font-semibold text-lg" style={{ color: accentColor }}>
        {num}
      </span>
    </motion.div>
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
      <StepNumber accentColor={step.accentColor} num={id} />
      <motion.h3
        className="mb-4 mt-4 font-semibold text-white text-xl md:mb-6 md:mt-6 md:text-3xl lg:text-4xl"
        initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, ...springSmooth }}
      >
        {title}
      </motion.h3>
      <motion.p
        className="max-w-md text-base text-white/45 leading-relaxed md:text-lg"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        {description}
      </motion.p>

      {/* Decorative accent line */}
      <motion.div
        className="mt-8 h-px w-full max-w-xs"
        style={{
          background: `linear-gradient(90deg, ${step.accentColor}30, transparent)`,
        }}
        initial={{ scaleX: 0, originX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6, duration: 0.8 }}
      />
    </div>
  );

  return (
    <motion.div
      className="group relative flex flex-col overflow-clip rounded-2xl border border-white/4 bg-[#060606] transition-all duration-500 hover:border-white/8 md:grid md:grid-cols-2 md:gap-0 md:bg-linear-to-br md:from-white/2 md:to-transparent"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Hover gradient overlay */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-700 group-hover:opacity-100"
        style={{
          background: `radial-gradient(ellipse at ${isReversed ? "0% 50%" : "100% 50%"}, ${step.accentColor}06, transparent 70%)`,
        }}
      />

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

/* ── Feature card with 3D tilt on hover ── */
type FeatureCardProps = {
  card: FeatureCardData;
  index: number;
};

function FeatureCard({ card, index }: FeatureCardProps) {
  const { title, description, imageSrc, accentColor, accentGlow } = card;
  const cardRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [4, -4]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-4, 4]), {
    stiffness: 300,
    damping: 30,
  });

  const handleMouseMove = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      const rect = cardRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
      mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    },
    [mouseX, mouseY]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  return (
    <GradientBorderCard accentColor={accentColor}>
      <motion.div
        ref={cardRef}
        className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/6 bg-[#060606] p-6 transition-colors duration-500 hover:border-white/10"
        style={{
          rotateX,
          rotateY,
          transformPerspective: 1200,
          transformStyle: "preserve-3d",
        }}
        initial={{ opacity: 0, y: 50, filter: "blur(8px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-30px" }}
        transition={{
          delay: index * 0.12,
          duration: 0.7,
          ease: [0.22, 1, 0.36, 1],
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Hover glow overlay */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${accentGlow}, transparent 70%)`,
          }}
        />

        <div
          className="relative mb-6 aspect-video max-h-128"
          style={{ transform: "translateZ(20px)" }}
        >
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

        <div style={{ transform: "translateZ(30px)" }}>
          <motion.h3
            className="relative mb-3 font-semibold text-xl text-white md:mb-4 md:text-2xl lg:text-3xl"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 + index * 0.1, ...springSmooth }}
          >
            {title}
          </motion.h3>

          <motion.p
            className="relative text-sm text-white/40 leading-relaxed md:text-base"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 + index * 0.1, duration: 0.5 }}
          >
            {description}
          </motion.p>
        </div>

        {/* Bottom accent line */}
        <motion.div
          className="absolute inset-x-0 bottom-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${accentColor}40, transparent)`,
          }}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 + index * 0.1, duration: 0.8 }}
        />

        {/* Corner accents */}
        <motion.div
          className="pointer-events-none absolute top-0 right-0 h-16 w-16"
          style={{
            background: `radial-gradient(circle at 100% 0%, ${accentColor}08, transparent 70%)`,
          }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 + index * 0.1 }}
        />
      </motion.div>
    </GradientBorderCard>
  );
}

/* ── Vertical timeline connector ── */
function TimelineConnector({ accentColor }: { accentColor: string }) {
  return (
    <div className="relative mx-auto hidden h-16 w-px md:flex md:h-20 lg:h-24">
      <motion.div
        className="h-full w-full"
        style={{
          background: `linear-gradient(180deg, ${accentColor}30, ${accentColor}08)`,
        }}
        initial={{ scaleY: 0, originY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full"
        style={{ backgroundColor: accentColor }}
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, type: "spring", stiffness: 500 }}
      />
    </div>
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
          subtitle="Three simple steps to transform your team's knowledge into actionable intelligence."
        />
      </InView>

      <div className="flex w-full flex-col text-white">
        {steps.map((step, idx) => (
          <div key={step.id}>
            <ProcessStep step={step} />
            {idx < steps.length - 1 ? (
              <TimelineConnector accentColor={steps[idx + 1].accentColor} />
            ) : null}
          </div>
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

      <div className="grid w-full grid-cols-1 gap-8 sm:grid-cols-2 md:gap-10 lg:gap-12">
        {cards.map((card, idx) => (
          <FeatureCard card={card} index={idx} key={card.id} />
        ))}
      </div>
    </div>
  );
}

// Main Component
export default function Features() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen flex-col items-center justify-center gap-20 overflow-hidden bg-black px-5 py-20 sm:px-8 md:gap-40 md:px-12 md:py-32"
    >
      {/* Parallax dot grid background */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          y: backgroundY,
        }}
      />

      {/* Ambient radial glows */}
      <motion.div
        className="pointer-events-none absolute top-0 left-1/2 h-150 w-200 -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.03)_0%,transparent_70%)]"
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="pointer-events-none absolute bottom-0 left-1/3 h-125 w-150 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.02)_0%,transparent_70%)]"
        animate={{
          scale: [1, 1.12, 1],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 3,
        }}
      />

      {/* Floating particles */}
      <FeatureParticles />

      {/* Process section */}
      <div className="relative w-full py-8">
        <ProcessSection steps={processSteps} />
      </div>

      {/* Animated divider with glow */}
      <motion.div
        className="relative w-full max-w-360"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="h-px w-full bg-linear-to-r from-transparent via-white/10 to-transparent" />
        <motion.div
          className="absolute left-1/2 top-0 h-px w-1/3 -translate-x-1/2 bg-linear-to-r from-transparent via-white/20 to-transparent blur-sm"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      <WorkflowSection cards={featureCards} />
    </section>
  );
}
