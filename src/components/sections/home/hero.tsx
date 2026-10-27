"use client";

import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Bell,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Clock,
  GitMerge,
  GitPullRequest,
  HelpCircle,
  Loader2,
  Mic,
  MonitorPlay,
  MoreHorizontal,
  PanelLeft,
  PanelRight,
  Pause,
  Pin,
  Play,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SessionScenario = {
  analysis: string;
  author: string;
  baseBranch: string;
  chatCardDiffMinus: number;
  chatCardDiffPlus: number;
  chatCardRepo: string;
  chatCardTitle: string;
  checksPassed: string;
  diffMinus: number;
  diffPlus: number;
  filesChanged: string;
  followUpText: string;
  headBranch: string;
  id: string;
  prNumber: string;
  prStatus: string;
  prompt1: string;
  prompt2: string;
  recordingEnv: string;
  recordingTitle: string;
  replyPara1: string;
  replyPara2: string;
  repoPath: string;
  sizeBadge: string;
  title: string;
  trace1: string;
  trace2: string;
  trace2Minus: number;
  trace2Plus: number;
  unread?: boolean;
  videoStartTime: number;
};

const sessionScenarios: SessionScenario[] = [
  {
    id: "enterprise-sso",
    title: "Add enterprise MSA & SSO",
    sizeBadge: "XL",
    unread: true,
    prStatus: "Verified Open",
    repoPath: "acme/enterprise-msa",
    prNumber: "#2922",
    author: "m.lin",
    baseBranch: "standard-msa",
    headBranch: "enterprise-sso",
    filesChanged: "12 clauses verified",
    diffPlus: 8,
    diffMinus: 14,
    prompt1: "Add SAML SSO & EU residency terms for Acme Corp ($68k ACV)",
    prompt2:
      "Follow our Q4 Playbook approval patterns and verify if a 20% annual discount requires Legal redline. Keep standard Net-30 billing working for everyone else.",
    trace1: "Explored deal context across 3 repositories & Salesforce CRM",
    trace2: "Cross-checked Q4_Playbook.pdf & Acme_MSA_v3.pdf",
    trace2Plus: 13,
    trace2Minus: 1,
    replyPara1:
      "Here’s the verified Deal Packet. Enterprise admins can now lock SAML SSO in Annex B, and the 20% annual discount clears via VP Sales sign-off without Legal redline.",
    replyPara2:
      "I verified clause attribution, EU-Central regional pinning, and live Salesforce opportunity sync. Existing Net-30 order form terms remain intact and all checks pass.",
    checksPassed: "5 checks passed",
    chatCardTitle: "feat: Add SAML SSO & 20% Enterprise Order Form",
    chatCardRepo: "acme/enterprise-msa #2922",
    chatCardDiffPlus: 9,
    chatCardDiffMinus: 14,
    followUpText:
      "Added to the Deal Room. Admins can enforce SAML SSO once Annex B is countersigned. I also attached page-locked citations for SOC 2 and recovery access.",
    analysis:
      "Locks SAML single sign-on and AWS Frankfurt (eu-central-1) residency for Acme Corp. Clears the 20% annual discount under Q4 Playbook §3.2 with zero Legal redlines.",
    recordingTitle: "Clause verification",
    recordingEnv: "on Salesient Deal Room environment",
    videoStartTime: 0,
  },
  {
    id: "multi-region",
    title: "Add multi-region GDPR addendum",
    sizeBadge: "L",
    unread: true,
    prStatus: "Verified Open",
    repoPath: "globex/dpa-addendum",
    prNumber: "#3104",
    author: "k.park",
    baseBranch: "us-east-default",
    headBranch: "eu-frankfurt-dpa",
    filesChanged: "9 schedules indexed",
    diffPlus: 14,
    diffMinus: 3,
    prompt1: "Verify EU data residency & multi-region failover clauses",
    prompt2:
      "Cross-reference Globex's security redlines against our standard security controls and flag any liability cap deviations.",
    trace1: "Indexed 48 pages of Globex_DPA_Redline.pdf",
    trace2: "Mapped sub-processor schedules & regional failover",
    trace2Plus: 18,
    trace2Minus: 2,
    replyPara1:
      "All 9 regional data residency clauses map cleanly to our Frankfurt and Dublin clusters. Standard 2x ACV cap holds under Master Agreement §11.3.",
    replyPara2:
      "I generated the redline comparison table and linked every security response to the source documentation.",
    checksPassed: "7 checks passed",
    chatCardTitle: "compliance: Multi-region DPA & Annex B lock",
    chatCardRepo: "globex/dpa-addendum #3104",
    chatCardDiffPlus: 14,
    chatCardDiffMinus: 3,
    followUpText:
      "Synced directly to Salesforce Opportunity #SF-9042. Reviewers have one-click access to the exact source pages.",
    analysis:
      "Validates multi-region failover between Frankfurt and Dublin. Confirms isolated workspace storage and standard liability caps.",
    recordingTitle: "DPA clause audit",
    recordingEnv: "on Salesient Vault Inspector",
    videoStartTime: 3.0,
  },
  {
    id: "rate-card",
    title: "Upgrade Q4 enterprise rate card",
    sizeBadge: "M",
    unread: false,
    prStatus: "Citations Locked",
    repoPath: "revops/q4-pricing",
    prNumber: "#2819",
    author: "s.chen",
    baseBranch: "q3-tiers",
    headBranch: "q4-enterprise-matrix",
    filesChanged: "6 sheets parsed",
    diffPlus: 22,
    diffMinus: 6,
    prompt1:
      "Parse Global_Rate_Card_2026.xlsx and preserve nested volume tiers",
    prompt2:
      "Ensure multi-year ramp deals automatically calculate blended ACV margin thresholds for Deal Desk sign-off.",
    trace1: "Parsed 6 multi-tab spreadsheets with table hierarchy intact",
    trace2: "Indexed 312 pricing cells & volume discount brackets",
    trace2Plus: 22,
    trace2Minus: 6,
    replyPara1:
      "The Q4 Enterprise Rate Card is now live in the workspace index with full table hierarchy preservation.",
    replyPara2:
      "Reps querying custom SKU bundles or 3-year ramp schedules now receive exact cell-level citations.",
    checksPassed: "6 checks passed",
    chatCardTitle: "pricing: Q4 Enterprise SKU Matrix & Ramp Thresholds",
    chatCardRepo: "revops/q4-pricing #2819",
    chatCardDiffPlus: 22,
    chatCardDiffMinus: 6,
    followUpText:
      "All active Deal Rooms now reference the updated Q4 margin guardrails automatically.",
    analysis:
      "Preserves complex multi-sheet pricing tables without flattening headers. Locks SKU tier calculations to verified RevOps formulas.",
    recordingTitle: "Table schema lock",
    recordingEnv: "on Salesient Deal Room",
    videoStartTime: 5.8,
  },
];

const secondarySidebarSessions = [
  {
    id: "latency-spike",
    label: "Investigate CRM webhook delta sync",
    status: "running" as const,
    unread: false,
  },
  {
    id: "patch-deps",
    label: "Patch liability super-cap clauses",
    status: "idle" as const,
    unread: false,
  },
  {
    id: "fix-checkout",
    label: "Fix failing order form tax tables",
    status: "idle" as const,
    unread: false,
  },
  {
    id: "review-auth",
    label: "Review InfoSec questionnaire...",
    status: "idle" as const,
    unread: true,
  },
  {
    id: "expand-coverage",
    label: "Expand competitor battlecards",
    status: "chevron" as const,
    unread: false,
  },
  {
    id: "doc-arch",
    label: "Document SOC 2 isolation spec...",
    status: "idle" as const,
    unread: true,
  },
];

const scrubberSteps = [
  { id: 0, stepLabel: "1/5", time: 0, ratio: 105 },
  { id: 1, stepLabel: "2/5", time: 2.0, ratio: 105 },
  { id: 2, stepLabel: "3/5", time: 4.0, ratio: 105 },
  { id: 3, stepLabel: "4/5", time: 6.0, ratio: 81 },
  { id: 4, stepLabel: "5/5", time: 7.2, ratio: 81 },
];

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [selectedSessionIdx, setSelectedSessionIdx] = useState(0);
  const [activeStep, setActiveStep] = useState(1); // Matches "2/5" in screenshot by default
  const [stepProgress, setStepProgress] = useState(28);
  const [isPlaying, setIsPlaying] = useState(true);

  const activeScenario = sessionScenarios[selectedSessionIdx];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const handleTimeUpdate = () => {
      const t = video.currentTime;
      const d = video.duration || 8.5;
      const normalized = Math.min(0.999, Math.max(0, t / d));
      const segmentFloat = normalized * 5;
      const segIdx = Math.min(4, Math.floor(segmentFloat));
      const segPercent = Math.round((segmentFloat - segIdx) * 100);

      setActiveStep(segIdx);
      setStepProgress(segPercent);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, []);

  const handleSelectSession = (idx: number) => {
    setSelectedSessionIdx(idx);
    const video = videoRef.current;
    if (video) {
      video.currentTime = sessionScenarios[idx].videoStartTime;
      video.play().catch(() => null);
      setIsPlaying(true);
    }
  };

  const handleSelectScrubber = (idx: number) => {
    setActiveStep(idx);
    setStepProgress(28);
    const video = videoRef.current;
    if (video) {
      const d = video.duration || 8.5;
      video.currentTime = (idx / 5) * d + 0.2;
      video.play().catch(() => null);
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    if (video.paused) {
      video.play().catch(() => null);
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  return (
    <section className="relative mx-auto w-full overflow-x-clip bg-[#050507] px-4 pt-28 pb-20 sm:px-6 md:pt-36 md:pb-28 lg:px-8">
      {/* Subtle Top Radial Atmosphere */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[620px] bg-[radial-gradient(ellipse_75%_50%_at_50%_0%,rgba(255,255,255,0.06)_0%,transparent_75%)]"
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        {/* ═══════════════════════════════════════════════════════════════════
            1. DEVIN-STYLE LEFT-ALIGNED HERO INTRO BLOCK (Clean, Zero Pill Clutter)
           ═══════════════════════════════════════════════════════════════════ */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="flex max-w-[580px] flex-col items-start gap-6"
          initial={{ opacity: 0, y: 18 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="space-y-4">
            <h1 className="font-semibold text-4xl text-white leading-[1.08] tracking-[-0.03em] sm:text-5xl lg:text-[3.35rem]">
              Meet Salesient, your team&apos;s{" "}
              <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                autonomous deal intelligence.
              </span>
            </h1>

            <p className="max-w-[46ch] text-base text-zinc-400 leading-relaxed sm:text-[17px]">
              Salesient connects your contracts, playbooks, spreadsheets, and
              CRM, verifies every clause in its own workspace, and won&apos;t
              stop until the answer is ready to share.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link href="/login">
              <Button
                className="h-[42px] cursor-pointer rounded-full bg-white px-5 font-medium text-[15px] text-black shadow-[0_0_25px_rgba(255,255,255,0.15)] transition-opacity hover:bg-zinc-100 hover:opacity-90"
                type="button"
              >
                Get started
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                className="h-[42px] cursor-pointer rounded-full border border-white/15 bg-transparent px-5 font-medium text-[15px] text-white transition-colors hover:border-white/25 hover:bg-white/[0.05]"
                type="button"
                variant="outline"
              >
                Book a demo
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════════
            2. DEVIN-STYLE COLLAGE BACKDROP + INTERACTIVE WORKSPACE SHOWCASE
           ═══════════════════════════════════════════════════════════════════ */}
        <div className="relative mt-14 lg:mt-20">
          {/* ── Background Architectural & Archival Artifacts Collage ── */}
          <div
            aria-hidden="true"
            className="-inset-x-24 -inset-y-14 pointer-events-none absolute select-none overflow-hidden"
          >
            {/* Top-Left Geometric Compass / Protractor Blueprint Artifact */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              className="-left-10 absolute top-2 hidden h-[250px] w-[220px] overflow-hidden rounded-lg border border-sky-400/20 bg-[#0b1520]/80 p-3 shadow-2xl xl:block"
              transition={{
                duration: 11,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(56,189,248,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(56,189,248,0.08)_1px,transparent_1px)] bg-[size:16px_16px]" />
              <svg
                aria-hidden="true"
                className="relative h-full w-full text-sky-300/45"
                viewBox="0 0 200 220"
              >
                <circle
                  cx="20"
                  cy="110"
                  fill="none"
                  r="150"
                  stroke="currentColor"
                  strokeWidth="1"
                />
                <circle
                  cx="20"
                  cy="110"
                  fill="none"
                  r="120"
                  stroke="currentColor"
                  strokeDasharray="3 3"
                  strokeWidth="0.8"
                />
                <circle
                  cx="20"
                  cy="110"
                  fill="none"
                  r="85"
                  stroke="currentColor"
                  strokeWidth="0.8"
                />
                <line
                  stroke="currentColor"
                  strokeWidth="0.7"
                  x1="20"
                  x2="195"
                  y1="110"
                  y2="110"
                />
                <line
                  stroke="currentColor"
                  strokeWidth="0.7"
                  x1="20"
                  x2="180"
                  y1="110"
                  y2="30"
                />
                <line
                  stroke="currentColor"
                  strokeWidth="0.7"
                  x1="20"
                  x2="180"
                  y1="110"
                  y2="190"
                />
              </svg>
            </motion.div>

            {/* Top-Center Blurred Archival Code Snippet */}
            <div className="-top-10 absolute left-[38%] hidden h-[110px] w-[150px] rounded-lg border border-white/10 bg-[#141418]/70 p-3 opacity-55 blur-[3px] lg:block">
              <div className="space-y-1.5 font-mono text-[7px] text-zinc-400">
                <p>if (acv &gt;= 50000) &#123;</p>
                <p className="pl-2 text-emerald-400">maxDiscount = 0.22;</p>
                <p className="pl-2">requireVpSignoff();</p>
                <p>&#125;</p>
              </div>
            </div>

            {/* Top-Center-Right Soft Blurred Card */}
            <div className="-top-8 absolute left-[58%] hidden h-[100px] w-[140px] rounded-lg border border-sky-400/15 bg-sky-950/30 p-3 opacity-50 blur-[5px] lg:block" />

            {/* Top-Right Punch-Card / Matrix Grid */}
            <motion.div
              animate={{ y: [0, 5, 0] }}
              className="absolute top-2 right-2 hidden h-[125px] w-[265px] overflow-hidden rounded-lg border border-sky-300/20 bg-[#0d1624]/85 p-3 shadow-2xl lg:block"
              transition={{
                duration: 13,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              <div className="font-mono text-[7px] text-sky-200/60 leading-[1.35] tracking-widest">
                <p>0000000000 11111111 00000 1111 00000000</p>
                <p>1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17</p>
                <p className="text-sky-300/80">
                  1111100000 00000111 11111 0000 11111111
                </p>
                <p>00000 111111 0000000 11 00000 111111111</p>
                <p>18 19 20 21 22 23 24 25 26 27 28 29 30 31</p>
                <p>1111100000 00000111 11111 0000 11111111</p>
                <p>32 33 34 35 36 37 38 39 40 41 42 43 44 45</p>
              </div>
            </motion.div>

            {/* Mid-Left Blurred Manuscript Card */}
            <div className="-left-14 absolute top-[48%] hidden h-[160px] w-[120px] rounded-lg border border-white/10 bg-zinc-900/65 p-3 opacity-45 blur-[4px] xl:block">
              <div className="h-full w-full border border-white/10 border-dashed p-2">
                <div className="h-2 w-12 rounded bg-white/20" />
                <div className="mt-2 space-y-1">
                  <div className="h-1.5 w-full rounded bg-white/10" />
                  <div className="h-1.5 w-4/5 rounded bg-white/10" />
                  <div className="h-1.5 w-full rounded bg-white/10" />
                </div>
              </div>
            </div>

            {/* Mid-Right Subtle Card */}
            <div className="-right-12 absolute top-[36%] hidden h-[210px] w-[140px] rounded-lg border border-white/10 bg-[#121318]/80 p-3 opacity-70 shadow-xl xl:block">
              <div className="flex h-full flex-col justify-between rounded border border-white/10 bg-black/50 p-2">
                <div className="h-1.5 w-12 rounded bg-white/20" />
                <div className="space-y-1.5">
                  <div className="h-1 w-full bg-emerald-400/40" />
                  <div className="h-1 w-2/3 bg-sky-400/40" />
                  <div className="h-1 w-4/5 bg-white/20" />
                </div>
                <div className="h-1.5 w-16 rounded bg-white/15" />
              </div>
            </div>

            {/* Bottom-Left & Bottom-Right Soft Depth-of-Field Artifacts */}
            <div className="absolute bottom-2 left-16 hidden h-[90px] w-[130px] rounded-lg border border-white/10 bg-zinc-800/40 opacity-45 blur-[6px] lg:block" />
            <div className="-bottom-10 absolute right-[22%] hidden h-[95px] w-[115px] rounded-lg border border-amber-200/15 bg-amber-950/20 p-2 opacity-55 blur-[3px] lg:block" />
          </div>

          {/* ═════════════════════════════════════════════════════════════════
              MAIN DESKTOP APPLICATION SHOWCASE + FLOATING INSPECTOR CARD
             ═════════════════════════════════════════════════════════════════ */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="relative mx-auto w-full"
            initial={{ opacity: 0, y: 24 }}
            transition={{
              duration: 0.65,
              delay: 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {/* Outer Desktop App Frame (Aligned left=0 to right=0 of max-w-7xl) */}
            <div className="relative lg:pr-[100px] xl:pr-[120px]">
              <div className="flex min-h-[580px] w-full flex-col overflow-hidden rounded-2xl border border-white/[0.11] bg-[#0c0c10]/95 p-1.5 shadow-[0_30px_90px_-15px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-xl md:flex-row lg:min-h-[640px]">
                {/* ───────────────────────────────────────────────────────────
                    LEFT SIDEBAR (260px - Matches Devin's Sidebar Chrome)
                   ─────────────────────────────────────────────────────────── */}
                <div className="flex w-full shrink-0 flex-col rounded-xl border border-white/[0.07] bg-[#111116] shadow-inner md:w-[248px] lg:w-[264px]">
                  {/* macOS Window Traffic Lights & Top Utility Icons (Fixed h-11 to match center top bar) */}
                  <div className="flex h-11 items-center justify-between px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded-full bg-[#ff544e]" />
                        <span className="h-3 w-3 rounded-full bg-[#ffbb00]" />
                        <span className="h-3 w-3 rounded-full bg-[#00c926]" />
                      </div>
                      <div className="flex items-center gap-0.5 text-zinc-500">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-white/[0.05] hover:text-zinc-300">
                          <PanelLeft className="h-3.5 w-3.5" />
                        </span>
                        <span className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-white/[0.05] hover:text-zinc-300">
                          <ArrowLeft className="h-3.5 w-3.5" />
                        </span>
                        <span className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-white/[0.05] hover:text-zinc-300">
                          <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 text-zinc-400">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-white/[0.05] hover:text-white">
                        <Search className="h-3.5 w-3.5" />
                      </span>
                      <span className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-white/[0.05] hover:text-white">
                        <Bell className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>

                  {/* Primary Navigation Links */}
                  <div className="hidden flex-col gap-0.5 px-2 text-[12.5px] text-zinc-300 md:flex">
                    {[
                      { icon: Plus, label: "New session" },
                      { icon: Clock, label: "Automations" },
                      { icon: ShieldCheck, label: "Security" },
                      { icon: GitPullRequest, label: "Review" },
                      { icon: BookOpen, label: "Knowledge Wiki" },
                      { icon: MoreHorizontal, label: "More" },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-white/[0.05] hover:text-white"
                          key={item.label}
                        >
                          <Icon className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                          <span className="truncate">{item.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Sessions Section Header */}
                  <div className="mt-1 flex items-center justify-between px-4 py-2 text-[12px]">
                    <span className="font-medium text-zinc-200">Sessions</span>
                    <div className="flex items-center gap-1 text-zinc-500">
                      <Plus className="h-3.5 w-3.5 cursor-pointer hover:text-zinc-300" />
                      <SlidersHorizontal className="h-3 w-3 cursor-pointer hover:text-zinc-300" />
                      <MoreHorizontal className="h-3.5 w-3.5 cursor-pointer hover:text-zinc-300" />
                    </div>
                  </div>

                  {/* Pinned Interactive Deal Sessions */}
                  <div className="flex flex-1 flex-col justify-between overflow-hidden px-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] text-zinc-500">
                        <Pin className="h-3 w-3" />
                        <span className="font-medium">Pinned</span>
                        <span className="text-zinc-600">3</span>
                      </div>

                      {/* 3 Interactive Pinned Scenarios */}
                      {sessionScenarios.map((scenario, idx) => {
                        const isSelected = selectedSessionIdx === idx;
                        return (
                          <button
                            className={cn(
                              "flex h-8 w-full cursor-pointer items-center gap-2 rounded-lg px-2 text-left text-[12.5px] transition-colors",
                              isSelected
                                ? "bg-white/[0.09] font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                                : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                            )}
                            key={scenario.id}
                            onClick={() => handleSelectSession(idx)}
                            type="button"
                          >
                            {idx < 2 ? (
                              <GitPullRequest className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                            )}
                            <span className="min-w-0 flex-1 truncate">
                              {scenario.title}
                            </span>
                            {scenario.unread && (
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                            )}
                          </button>
                        );
                      })}

                      {/* Secondary Session Items (Visual Realism from Devin Screenshot) */}
                      <div className="hidden space-y-0.5 pt-1 md:block">
                        {secondarySidebarSessions.map((sec) => (
                          <div
                            className="flex h-7 items-center gap-2 rounded-lg px-2 text-[12px] text-zinc-400/90 transition-colors hover:bg-white/[0.03] hover:text-zinc-200"
                            key={sec.id}
                          >
                            <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                              {sec.status === "running" && (
                                <Loader2 className="h-3 w-3 animate-spin text-zinc-400" />
                              )}
                              {sec.status === "chevron" && (
                                <ChevronRight className="h-3 w-3 text-zinc-500" />
                              )}
                            </span>
                            <span className="min-w-0 flex-1 truncate">
                              {sec.label}
                            </span>
                            {sec.unread && (
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                            )}
                          </div>
                        ))}
                        <div className="flex h-7 items-center gap-2 px-2 text-[12px] text-zinc-500">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                          <span>More</span>
                        </div>
                      </div>

                      {/* Participated Section */}
                      <div className="hidden pt-3 lg:block">
                        <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] text-zinc-500">
                          <Users className="h-3 w-3" />
                          <span className="font-medium">Participated</span>
                          <span className="text-zinc-600">12</span>
                        </div>
                        <div className="flex h-7 items-center gap-2 px-2 text-[12px] text-zinc-400">
                          <span className="w-3.5 shrink-0" />
                          <span className="truncate">
                            Review Q4 API rate limits
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* User Profile Footer */}
                    <div className="mt-2 flex items-center justify-between border-white/[0.06] border-t px-1.5 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-gradient-to-br from-zinc-700 to-zinc-900 font-semibold text-[11px] text-white">
                          ML
                        </div>
                        <div className="leading-tight">
                          <p className="font-medium text-[12px] text-zinc-200">
                            Maya Lin
                          </p>
                          <p className="text-[10.5px] text-zinc-500">
                            Salesient
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-zinc-500">
                        <HelpCircle className="h-3.5 w-3.5 cursor-pointer hover:text-zinc-300" />
                        <Settings className="h-3.5 w-3.5 cursor-pointer hover:text-zinc-300" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ───────────────────────────────────────────────────────────
                    CENTER AGENT CONVERSATION PANE
                   ─────────────────────────────────────────────────────────── */}
                <div className="flex min-w-0 flex-1 flex-col justify-between bg-[#09090d]">
                  {/* Center Top Header Bar — Full Width of Window */}
                  <div className="flex h-11 items-center justify-between border-white/[0.06] border-b px-4">
                    <div className="flex min-w-0 items-center gap-2">
                      <div className="flex items-center gap-1.5 truncate font-medium text-[13px] text-zinc-200">
                        <GitPullRequest className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                        <span className="truncate">{activeScenario.title}</span>
                      </div>
                      <span className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[11px] text-zinc-400">
                        {activeScenario.sizeBadge}
                      </span>

                      {/* Overlapping Stack Integration Badges */}
                      <div className="hidden items-center pl-1 sm:flex">
                        <span className="-mr-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-black bg-[#181820] p-0.5">
                          {/** biome-ignore lint/performance/noImgElement: connector badge */}
                          {/** biome-ignore lint/correctness/useImageSize: CSS sized */}
                          <img
                            alt="Slack"
                            className="h-full w-full object-contain"
                            src="/integrations/slack.png"
                          />
                        </span>
                        <span className="-mr-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-black bg-[#181820] p-0.5">
                          {/** biome-ignore lint/performance/noImgElement: connector badge */}
                          {/** biome-ignore lint/correctness/useImageSize: CSS sized */}
                          <img
                            alt="Salesforce"
                            className="h-full w-full object-contain"
                            src="/integrations/salesforce.png"
                          />
                        </span>
                        <span className="-mr-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-black bg-[#181820] p-0.5">
                          {/** biome-ignore lint/performance/noImgElement: connector badge */}
                          {/** biome-ignore lint/correctness/useImageSize: CSS sized */}
                          <img
                            alt="Gmail"
                            className="h-full w-full object-contain"
                            src="/integrations/gmail.png"
                          />
                        </span>
                        <span className="flex h-5 w-5 items-center justify-center rounded-full border border-black bg-emerald-500/20 text-emerald-400">
                          <GitMerge className="h-2.5 w-2.5" />
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-zinc-500">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-white/[0.05] hover:text-zinc-300">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </span>
                      <span className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-white/[0.05] hover:text-zinc-300">
                        <PanelRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>

                  {/* Conversation Stream & Composer Wrapper (inset on lg/xl to clear the floating card) */}
                  <div className="flex flex-1 flex-col justify-between lg:pr-[315px] xl:pr-[335px]">
                    <AnimatePresence mode="wait">
                      <motion.div
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-1 flex-col justify-end gap-4 px-4 py-5 sm:px-6"
                        exit={{ opacity: 0, y: -6 }}
                        initial={{ opacity: 0, y: 6 }}
                        key={activeScenario.id}
                        transition={{ duration: 0.22 }}
                      >
                        {/* Right-Aligned User Prompt Bubbles */}
                        <div className="flex flex-col items-end gap-1.5">
                          <p className="rounded-[18px] rounded-tr-[4px] border border-white/[0.08] bg-[#171720] px-3.5 py-2 text-[13px] text-zinc-100">
                            {activeScenario.prompt1}
                          </p>
                          <p className="max-w-[440px] rounded-[18px] border border-white/[0.08] bg-[#171720] px-3.5 py-2 text-[13px] text-zinc-200 leading-relaxed">
                            {activeScenario.prompt2}
                          </p>
                        </div>

                        {/* Collapsible Agent Execution Trace Lines */}
                        <div className="space-y-1 pl-9 text-[12px] text-zinc-400">
                          <div className="flex items-center gap-1.5">
                            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                            <span className="truncate">
                              {activeScenario.trace1}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                            <span className="truncate">
                              {activeScenario.trace2}
                            </span>
                            <span className="font-mono text-[11px] text-emerald-400">
                              +{activeScenario.trace2Plus}
                            </span>
                            <span className="font-mono text-[11px] text-rose-400">
                              -{activeScenario.trace2Minus}
                            </span>
                          </div>
                        </div>

                        {/* Salesient Agent Response */}
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/15 bg-black p-1 shadow-sm">
                            {/** biome-ignore lint/performance/noImgElement: brand mark */}
                            {/** biome-ignore lint/correctness/useImageSize: CSS sized */}
                            <img
                              alt="Salesient"
                              className="h-full w-full object-contain"
                              src="/salesient-mark.png"
                            />
                          </div>

                          <div className="min-w-0 flex-1 space-y-2 text-[13px] text-zinc-200 leading-relaxed">
                            <div className="flex items-baseline gap-2">
                              <span className="font-semibold text-white">
                                Salesient
                              </span>
                              <span className="text-[11px] text-zinc-500">
                                8:05 PM
                              </span>
                            </div>
                            <p>{activeScenario.replyPara1}</p>
                            <p className="text-zinc-300">
                              {activeScenario.replyPara2}
                            </p>
                          </div>
                        </div>

                        {/* Verification Check Trace */}
                        <div className="flex items-center gap-1.5 pl-9 text-[12px] text-zinc-400">
                          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                          <span className="truncate">
                            Verified clause attribution &amp; CRM sync in Deal
                            Room
                          </span>
                          <span className="shrink-0 font-medium text-emerald-400">
                            {activeScenario.checksPassed}
                          </span>
                        </div>

                        {/* Embedded Artifact / Deal Packet Card inside Chat */}
                        <div className="pl-9">
                          <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-white/[0.1] bg-[#111118] p-3.5 sm:flex-row sm:items-center">
                            <div className="min-w-0 space-y-1">
                              <p className="truncate font-medium text-[13px] text-white">
                                {activeScenario.chatCardTitle}
                              </p>
                              <div className="flex items-center gap-1.5 font-mono text-[11.5px] text-zinc-400">
                                <GitPullRequest className="h-3.5 w-3.5 text-emerald-400" />
                                <span>{activeScenario.chatCardRepo}</span>
                                <span>&middot;</span>
                                <span className="text-emerald-400">
                                  +{activeScenario.chatCardDiffPlus}
                                </span>
                                <span className="text-rose-400">
                                  -{activeScenario.chatCardDiffMinus}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-center">
                              <Link
                                className="inline-flex h-7 items-center rounded-md bg-white px-3 font-medium text-[12px] text-black transition-colors hover:bg-zinc-200"
                                href="/login"
                              >
                                View Deal Packet
                              </Link>
                            </div>
                          </div>
                        </div>

                        {/* Follow-up Agent Line */}
                        <p className="pl-9 text-[12.5px] text-zinc-400 leading-relaxed">
                          {activeScenario.followUpText}
                        </p>
                      </motion.div>
                    </AnimatePresence>

                    {/* Bottom Prompt Composer Box */}
                    <div className="p-3 sm:px-6 sm:pb-4">
                      <div className="flex flex-col justify-between gap-3 rounded-[18px] border border-white/[0.1] bg-[#111117] p-3 shadow-inner">
                        <p className="px-1 text-[13px] text-zinc-500">
                          Ask a deal question, audit an MSA, or run a security
                          questionnaire scan
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-zinc-400">
                            <span className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full hover:bg-white/[0.06] hover:text-white">
                              <Plus className="h-4 w-4" />
                            </span>
                            <span className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full hover:bg-white/[0.06] hover:text-white">
                              <SlidersHorizontal className="h-3.5 w-3.5" />
                            </span>
                            <span className="px-2 font-medium text-[12px] text-zinc-400">
                              Ultra
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-zinc-400 hover:bg-white/[0.06] hover:text-white">
                              <Mic className="h-3.5 w-3.5" />
                            </span>
                            <Link
                              aria-label="Start Deal Query"
                              className="flex h-7 items-center rounded-full bg-white text-black transition-opacity hover:opacity-90"
                              href="/login"
                            >
                              <span className="px-2">
                                <ArrowUp className="h-3.5 w-3.5" />
                              </span>
                              <span className="border-black/15 border-l px-1.5">
                                <ChevronDown className="h-3 w-3 opacity-70" />
                              </span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ═════════════════════════════════════════════════════════════
                  RIGHT OVERLAPPING FLOATING INSPECTOR CARD (Protrudes Right)
                 ═════════════════════════════════════════════════════════════ */}
              <motion.div
                animate={{ opacity: 1, x: 0, y: 0 }}
                className="relative z-20 mt-6 w-full rounded-2xl border border-white/[0.14] bg-[#12121a]/95 p-5 shadow-[0_32px_96px_-12px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.06)] backdrop-blur-2xl lg:absolute lg:top-12 lg:right-0 lg:mt-0 lg:w-[400px] xl:w-[440px]"
                initial={{ opacity: 0, x: 28, y: 12 }}
                transition={{
                  duration: 0.65,
                  delay: 0.18,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {/* PR / Verification Status Header */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[12.5px]">
                    <GitPullRequest className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="font-medium text-emerald-400">
                      {activeScenario.prStatus}
                    </span>
                    <span className="text-zinc-600">&middot;</span>
                    <span className="text-zinc-400">
                      {activeScenario.repoPath}{" "}
                      <span className="text-zinc-500">
                        {activeScenario.prNumber}
                      </span>
                    </span>
                  </div>

                  <h2 className="font-semibold text-white text-xl tracking-tight sm:text-[22px]">
                    {activeScenario.title}
                  </h2>

                  {/* Author, Branch Pills & Diff Counts */}
                  <div className="flex flex-wrap items-center gap-2.5 text-[12px] text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-zinc-700 font-semibold text-[9px] text-white">
                        M
                      </span>
                      <span className="text-zinc-300">
                        {activeScenario.author}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="rounded-md bg-white/[0.07] px-2 py-0.5 font-mono text-[11px] text-zinc-300">
                        {activeScenario.baseBranch}
                      </span>
                      <ArrowLeft className="h-3 w-3 text-zinc-500" />
                      <span className="rounded-md bg-white/[0.07] px-2 py-0.5 font-mono text-[11px] text-zinc-300">
                        {activeScenario.headBranch}
                      </span>
                    </div>

                    <span>{activeScenario.filesChanged}</span>

                    <span className="font-mono text-[11.5px]">
                      <span className="text-emerald-400">
                        +{activeScenario.diffPlus}
                      </span>{" "}
                      <span className="text-rose-400">
                        -{activeScenario.diffMinus}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Salesient's Analysis Block */}
                <div className="mt-5 space-y-1.5 border-white/[0.08] border-t pt-4">
                  <div className="flex items-center gap-1.5 font-medium text-[12.5px] text-zinc-400">
                    <Sparkles className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Salesient&apos;s analysis</span>
                  </div>
                  <p className="text-[13px] text-zinc-200 leading-relaxed">
                    {activeScenario.analysis}
                  </p>
                </div>

                {/* Embedded Live Verification Recording Box */}
                <div className="mt-5 rounded-xl border border-white/[0.08] bg-[#0b0b10] p-2">
                  <div className="flex items-center justify-between px-1.5 py-1 text-[12px]">
                    <div className="flex items-center gap-1.5 truncate">
                      <MonitorPlay className="h-3.5 w-3.5 shrink-0 text-zinc-300" />
                      <span className="font-medium text-white">
                        {activeScenario.recordingTitle}
                      </span>
                      <span className="truncate text-zinc-500">
                        {activeScenario.recordingEnv}
                      </span>
                    </div>
                    <span className="shrink-0 font-mono text-[11.5px] text-zinc-400">
                      {scrubberSteps[activeStep]?.stepLabel ?? "2/5"}
                    </span>
                  </div>

                  {/* macOS Virtual Environment Video Viewport */}
                  <div className="group relative mt-1 aspect-[16/10] w-full overflow-hidden rounded-lg border border-white/[0.08] bg-black">
                    <video
                      autoPlay
                      className="h-full w-full object-cover"
                      loop
                      muted
                      playsInline
                      ref={videoRef}
                      src="/salesient-explainer.mp4"
                    />

                    {/* Subtle Play/Pause Hover Button */}
                    <button
                      aria-label={isPlaying ? "Pause preview" : "Play preview"}
                      className="absolute right-2.5 bottom-2.5 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-black/70 text-white opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100"
                      onClick={togglePlay}
                      type="button"
                    >
                      {isPlaying ? (
                        <Pause className="h-3 w-3" />
                      ) : (
                        <Play className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </div>

                {/* 5-Segment Interactive Scrubber Bar (Matches Devin's Blue Progress Bar + White Knob) */}
                <div className="mt-3 flex w-full items-center gap-1 px-1 py-1.5">
                  {scrubberSteps.map((step, idx) => {
                    const isCompleted = idx < activeStep;
                    const isCurrent = idx === activeStep;
                    return (
                      <button
                        aria-label={`Jump to verification step ${step.stepLabel}`}
                        className="group relative h-1.5 cursor-pointer rounded-full bg-white/[0.12] transition-colors hover:bg-white/[0.2]"
                        key={step.id}
                        onClick={() => handleSelectScrubber(idx)}
                        style={{ flex: step.ratio }}
                        type="button"
                      >
                        {isCompleted && (
                          <div className="h-full w-full rounded-full bg-blue-500" />
                        )}
                        {isCurrent && (
                          <>
                            <div
                              className="h-full rounded-full bg-blue-500 transition-all duration-150"
                              style={{ width: `${stepProgress}%` }}
                            />
                            <span
                              className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 h-3.5 w-3.5 rounded-full border border-black/40 bg-white shadow-[0_2px_6px_rgba(0,0,0,0.6)] transition-all duration-150"
                              style={{ left: `${stepProgress}%` }}
                            />
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
