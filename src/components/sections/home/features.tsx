"use client";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { InView } from "@/components/ui/in-view";
import {
  useCallback,
  useMemo,
  useRef,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  Database,
  FileText,
  CheckCircle2,
  Search,
  ShieldCheck,
  Copy,
  Sparkles,
  ArrowRight,
  UploadCloud,
  Check,
  Layers,
} from "lucide-react";

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

const particleSeed = 1337;

function createSeededRandom(seed: number) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

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
    title: "Ingest & Index Knowledge",
    description:
      "Upload proposals, pitch decks, playbooks, and contracts. Salesient automatically parses tables, hierarchical sections, and generates semantic vector embeddings.",
    imageAlt: "Knowledge ingestion interface",
    isReversed: false,
    icon: "database",
    accentColor: "#38bdf8",
    mockElements: [
      "PDFs & Contracts",
      "CRM & Battlecards",
      "Structural Hierarchy",
    ],
  },
  {
    id: 2,
    title: "Hybrid Semantic Retrieval",
    description:
      "Query during deal prep or prospect calls. Sub-second hybrid retrieval pairs dense embeddings with lexical keyword matching to pinpoint exact clauses.",
    imageAlt: "Semantic search retrieval",
    isReversed: true,
    icon: "chart",
    accentColor: "#818cf8",
    mockElements: [
      "< 200ms Latency",
      "Dense Vector Match",
      "Exact Clause Ranking",
    ],
  },
  {
    id: 3,
    title: "Act on Cited Intelligence",
    description:
      "Get evidence-backed answers with deterministic citations back to source pages. Copy talking points or export deal memos with zero hallucinations.",
    imageAlt: "Attributed answers interface",
    isReversed: false,
    icon: "share",
    accentColor: "#34d399",
    mockElements: [
      "Page-Level Citations",
      "Zero Hallucinations",
      "One-Click Memo Export",
    ],
  },
];

/* ── Floating particles for ambient depth ── */
function FeatureParticles() {
  const particles = useMemo(() => {
    const rand = createSeededRandom(particleSeed);
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      size: rand() * 2 + 0.8,
      x: rand() * 100,
      y: rand() * 100,
      duration: rand() * 12 + 10,
      delay: rand() * 6,
      opacity: rand() * 0.12 + 0.03,
      driftX: rand() * 10 - 5,
    }));
  }, []);

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
            x: [0, p.driftX, 0],
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

/* ── Step 1: Ingest & Index Knowledge ── */
function IngestKnowledgeMock() {
  const sources = [
    {
      name: "Enterprise_Playbook_2025.pdf",
      type: "PDF",
      meta: "42 pages · 312 chunks",
      status: "Indexed",
    },
    {
      name: "SOC2_TypeII_Addendum.docx",
      type: "DOCX",
      meta: "18 pages · 145 chunks",
      status: "Indexed",
    },
    {
      name: "Salesforce_Deals_Sync",
      type: "CRM",
      meta: "1,420 records · Live sync",
      status: "Active",
    },
  ];

  return (
    <div className="flex flex-col gap-3 p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-sky-400" />
          <span className="font-medium text-xs text-zinc-300">
            Knowledge Ingestion
          </span>
        </div>
        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
          3 Sources Synced
        </span>
      </div>

      {/* Source Cards */}
      <div className="space-y-2">
        {sources.map((src) => (
          <div
            key={src.name}
            className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 transition-colors hover:border-white/15"
          >
            <div className="flex items-center gap-2.5">
              <span className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[9px] font-semibold text-zinc-400">
                {src.type}
              </span>
              <div>
                <p className="font-medium text-xs text-zinc-200">{src.name}</p>
                <p className="text-[10px] text-zinc-500">{src.meta}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
              <Check className="h-3 w-3" />
              <span className="text-[10px]">{src.status}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Status Bar */}
      <div className="mt-1 flex items-center justify-between border-t border-white/[0.06] pt-2.5 text-[10px] text-zinc-500">
        <span>Embeddings: 1536-dim Vectors</span>
        <span className="text-zinc-400">Hierarchy & Tables Preserved</span>
      </div>
    </div>
  );
}

/* ── Step 2: Hybrid Semantic Retrieval ── */
function SemanticRetrievalMock() {
  const matches = [
    {
      source: "Playbook §4.1 (p. 19)",
      score: "99.2% match",
      text: "Tier-1 SLA discounts are capped at 14.5% on multi-year commitments. Exceeding 15% requires VP of Sales approval.",
    },
    {
      source: "MSA_Template_v2.docx §7.1 (p. 6)",
      score: "95.4% match",
      text: "Standard invoicing schedule is Net-30 annually upfront unless specified otherwise in Schedule B.",
    },
  ];

  return (
    <div className="flex flex-col gap-3 p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-indigo-400" />
          <span className="font-medium text-xs text-zinc-300">
            Hybrid Retrieval Query
          </span>
        </div>
        <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-zinc-400">
          Latency: 178ms
        </span>
      </div>

      {/* Simulated Query Box */}
      <div className="rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-zinc-300">
        <span className="text-zinc-500">Q: </span>
        <span>
          What are standard payment terms and discount caps for 2-year
          enterprise deals?
        </span>
      </div>

      {/* Matched Chunks */}
      <div className="space-y-2">
        {matches.map((item) => (
          <div
            key={item.source}
            className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5"
          >
            <div className="flex items-center justify-between pb-1.5">
              <span className="font-mono text-[10px] text-indigo-300">
                {item.source}
              </span>
              <span className="rounded bg-indigo-500/10 px-1.5 py-0.2 text-[9px] font-medium text-indigo-400">
                {item.score}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Step 3: Act on Cited Intelligence ── */
function VerifiedAnswerMock() {
  return (
    <div className="flex flex-col gap-3 p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          <span className="font-medium text-xs text-zinc-300">
            Attributed Answer
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400 text-[10px]">
          <CheckCircle2 className="h-3 w-3" />
          <span>100% Attributed</span>
        </div>
      </div>

      {/* Synthesized Response */}
      <div className="space-y-2 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-xs text-zinc-300 leading-relaxed">
        <p>
          <strong className="text-white">1. Multi-Year Discount:</strong> Capped
          at <strong className="text-white">14.5%</strong>. Discretionary
          approval required for higher concessions.
        </p>
        <p>
          <strong className="text-white">2. Payment Schedule:</strong> Net-30
          annual upfront standard. Net-45 allowable for &gt;$75k ACV.
        </p>
      </div>

      {/* Citations */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-[10px] uppercase tracking-wider text-zinc-500">
          Sources:
        </span>
        <span className="inline-flex items-center gap-1 rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-zinc-300">
          <FileText className="h-3 w-3 text-zinc-400" />
          Playbook §4.1 (p. 19)
        </span>
        <span className="inline-flex items-center gap-1 rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-zinc-300">
          <ShieldCheck className="h-3 w-3 text-emerald-400" />
          MSA §7.1 (p. 6)
        </span>
      </div>

      {/* Action Footer */}
      <div className="flex items-center gap-2 border-t border-white/[0.06] pt-2.5">
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded border border-white/10 bg-white/[0.02] px-2.5 py-1 text-[11px] text-zinc-300 hover:border-white/20 hover:text-white"
        >
          <Copy className="h-3 w-3" />
          <span>Copy Talking Points</span>
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded border border-white/10 bg-white/[0.02] px-2.5 py-1 text-[11px] text-zinc-300 hover:border-white/20 hover:text-white"
        >
          <span>Export Deal Memo</span>
        </button>
      </div>
    </div>
  );
}

/* ── Process step mock UI router ── */
function ProcessMockUI({ step }: { step: ProcessStepData }) {
  const contentByStep: Record<number, React.ReactNode> = {
    1: <IngestKnowledgeMock />,
    2: <SemanticRetrievalMock />,
    3: <VerifiedAnswerMock />,
  };

  return (
    <div className="relative flex h-full w-full items-center justify-center p-3 sm:p-5 md:p-6">
      <div className="w-full overflow-hidden rounded-xl border border-white/[0.08] bg-[#0c0c0e] shadow-xl">
        {contentByStep[step.id]}
      </div>
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
      className={`flex w-full flex-col items-start justify-center gap-4 text-left md:items-center md:text-center ${className}`}
    >
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1 text-xs text-zinc-300">
        <span className="font-medium uppercase tracking-wider text-[11px]">
          {badge}
        </span>
      </div>
      <h2 className="max-w-3xl font-semibold text-3xl tracking-tight text-white sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="max-w-2xl text-base text-zinc-400 leading-relaxed sm:text-lg">
          {subtitle}
        </p>
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

type ProcessStepProps = {
  step: ProcessStepData;
};

function ProcessStep({ step }: ProcessStepProps) {
  const { id, title, description, imageSrc, imageAlt, isReversed } = step;

  const imageSection = (
    <div className="flex h-full w-full items-center justify-center bg-black/40">
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
    <div className="flex flex-col justify-center p-6 sm:p-8 md:p-10 lg:p-12">
      <div className="flex items-center gap-3">
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wider text-zinc-300">
          Phase 0{id}
        </span>
        <span className="h-px w-8 bg-white/10" />
      </div>

      <h3 className="mt-5 font-semibold text-2xl text-white md:text-3xl lg:text-4xl">
        {title}
      </h3>

      <p className="mt-3.5 text-base text-zinc-400 leading-relaxed">
        {description}
      </p>

      {/* Feature tags */}
      <div className="mt-6 flex flex-wrap gap-2">
        {step.mockElements.map((el) => (
          <span
            key={el}
            className="rounded-md border border-white/[0.08] bg-white/[0.02] px-2.5 py-1 text-xs text-zinc-400"
          >
            {el}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <motion.div
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#09090b] transition-colors hover:border-white/15 md:grid md:grid-cols-2"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
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

function TimelineConnector() {
  return (
    <div className="mx-auto my-6 h-8 w-px bg-linear-to-b from-white/20 to-transparent" />
  );
}

type ProcessSectionProps = {
  steps: ProcessStepData[];
};

function ProcessSection({ steps }: ProcessSectionProps) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center">
      <SectionHeader
        badge="How It Works"
        className="mb-12 md:mb-16"
        title="Surface verified insights in three simple steps"
        subtitle="From raw sales collateral to instant, source-backed answers in deal rooms."
      />

      <div className="flex w-full flex-col">
        {steps.map((step, idx) => (
          <div key={step.id}>
            <ProcessStep step={step} />
            {idx < steps.length - 1 ? <TimelineConnector /> : null}
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
  return (
    <section className="relative flex flex-col items-center justify-center gap-16 overflow-hidden bg-black px-4 py-16 sm:px-6 md:gap-28 md:px-10 md:py-24">
      {/* Process section */}
      <div className="relative w-full py-4">
        <ProcessSection steps={processSteps} />
      </div>

      {/* Clean separator */}
      <div className="w-full max-w-5xl border-t border-white/[0.08]" />

      <WorkflowSection cards={featureCards} />
    </section>
  );
}
