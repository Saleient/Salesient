"use client";

import {
  ArrowRight,
  CheckCircle2,
  Lock,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const videoPhases = [
  {
    id: 0,
    step: "01",
    label: "Multi-Source OAuth & PDF Ingestion",
    startTime: 0,
  },
  {
    id: 1,
    step: "02",
    label: "3D Vector Chunking & Laser Indexing",
    startTime: 3.2,
  },
  {
    id: 2,
    step: "03",
    label: "Citation-Locked Deal Intelligence",
    startTime: 6.2,
  },
];

const telemetryMetrics = [
  {
    value: "< 190ms",
    label: "Hybrid Retrieval Latency",
    detail: "Dense vector + BM25 lexical fusion",
  },
  {
    value: "100%",
    label: "Clause-Level Attribution",
    detail: "Every sentence tied to source page",
  },
  {
    value: "120+",
    label: "Native Stack Connectors",
    detail: "Salesforce, Zoho, Drive, Slack, Gmail",
  },
  {
    value: "SOC 2 & ISO",
    label: "Zero-Training Privacy",
    detail: "Tenant-isolated vector namespaces",
  },
];

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activePhase, setActivePhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const t = video.currentTime;
      const d = video.duration || 8;
      setProgress(Math.min(100, (t / d) * 100));

      if (t < 3.2) {
        setActivePhase(0);
      } else if (t < 6.2) {
        setActivePhase(1);
      } else {
        setActivePhase(2);
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, []);

  const seekToPhase = (idx: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = videoPhases[idx].startTime;
    video.play().catch(() => {});
    setIsPlaying(true);
    setActivePhase(idx);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const restartVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.play().catch(() => {});
    setIsPlaying(true);
    setActivePhase(0);
  };

  return (
    <section className="relative mx-auto w-full overflow-hidden bg-[#050507] px-4 pt-28 pb-20 sm:px-6 md:pt-36 md:pb-28 lg:px-8">
      {/* Subtle Architectural Grid & Balanced Ambient Illumination */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grid-subtle [mask-image:radial-gradient(ellipse_85%_65%_at_50%_30%,#000_30%,transparent_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-10 -left-32 h-[420px] w-[520px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.055)_0%,transparent_70%)] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-12 -right-24 h-[480px] w-[600px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.1)_0%,rgba(59,130,246,0.05)_45%,transparent_75%)] blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* ═══════════════════════════════════════════════════════════════════
            BALANCED 6/6 SPLIT HERO (EDITORIAL LEFT · CINEMATIC VIDEO RIGHT)
           ═══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-12">
          {/* ── LEFT COLUMN (6 Cols): Crisp Typography, CTAs & Trust Specs ── */}
          <motion.div
            initial={{ opacity: 0, x: -36 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-start text-left lg:col-span-6"
          >
            {/* Eyebrow Pill */}
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs text-zinc-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="font-medium text-white">
                Salesient RAG Engine
              </span>
              <span className="h-3 w-px bg-white/15" />
              <span className="text-emerald-400">Zero hallucinations</span>
            </div>

            {/* Balanced 3-Line Display Headline */}
            <h1 className="font-semibold text-4xl leading-[1.07] tracking-[-0.03em] text-white sm:text-5xl xl:text-[3.75rem]">
              Revenue intelligence,{" "}
              <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
                grounded in your stack.
              </span>
            </h1>

            {/* Clear Value Proposition */}
            <p className="mt-5 max-w-xl text-base text-zinc-400 leading-relaxed sm:text-[17px]">
              Connect your proposals, MSAs, battlecards, and live CRM records
              into one verifiable workspace. Salesient delivers instant,
              clause-cited answers for every high-stakes deal conversation.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Link href="/login">
                <Button
                  size="lg"
                  className="group h-11 cursor-pointer rounded-full bg-white px-7 text-sm font-semibold text-black shadow-[0_0_30px_rgba(255,255,255,0.18)] transition-all hover:bg-zinc-200"
                >
                  Start Free Workspace
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Button>
              </Link>
              <Link href="/integration">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-11 cursor-pointer rounded-full border-white/10 bg-white/[0.03] px-6 text-sm font-medium text-zinc-300 backdrop-blur-sm transition-colors hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                >
                  Explore 120+ Connectors
                </Button>
              </Link>
            </div>

            {/* Compact Architectural Checkpoints (Replaces bulky stacked boxes) */}
            <div className="mt-10 grid w-full grid-cols-1 gap-3 border-t border-white/[0.08] pt-7 sm:grid-cols-3">
              {[
                {
                  icon: Zap,
                  title: "< 190ms Retrieval",
                  sub: "Dense + BM25 fusion",
                },
                {
                  icon: CheckCircle2,
                  title: "100% Cited Clauses",
                  sub: "Locked to PDF & CRM",
                },
                {
                  icon: ShieldCheck,
                  title: "Zero Model Training",
                  sub: "SOC 2 & ISO isolated",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex items-start gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.015] p-3"
                  >
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-emerald-500/25 bg-emerald-500/10 text-emerald-400">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-xs text-white">
                        {item.title}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-zinc-500">
                        {item.sub}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* ── RIGHT COLUMN (6 Cols): Clean, Unobstructed Video Showcase ── */}
          <motion.div
            initial={{ opacity: 0, x: 36 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.65,
              delay: 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative lg:col-span-6"
          >
            {/* Outer Ambient Glow Rim */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-1 rounded-3xl bg-gradient-to-tr from-emerald-500/15 via-white/5 to-blue-500/15 opacity-70 blur-xl"
            />

            {/* Main Glass Showcase Frame (Zero overlapping badges) */}
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.12] bg-[#09090d] p-1.5 shadow-[0_32px_96px_-16px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.12)]">
              <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-[#050507]">
                {/* Top Window Bar — Clean & Unobstructed */}
                <div className="flex items-center justify-between border-b border-white/[0.07] bg-[#0b0b10] px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                      <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                      <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                    </div>
                    <div className="hidden h-3.5 w-px bg-white/10 sm:block" />
                    <div className="flex items-center gap-1.5">
                      <Lock className="h-3 w-3 text-emerald-400" />
                      <span className="font-mono text-[11px] text-zinc-300">
                        salesient://rag-pipeline
                      </span>
                    </div>
                  </div>

                  {/* Live Synced Stage Pill Inside Top Bar */}
                  <div className="flex items-center gap-2">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={videoPhases[activePhase].step}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.2 }}
                        className="hidden items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] text-emerald-300 sm:inline-flex"
                      >
                        <Sparkles className="h-2.5 w-2.5 text-emerald-400" />
                        <span>
                          {videoPhases[activePhase].step} &middot;{" "}
                          {videoPhases[activePhase].label}
                        </span>
                      </motion.span>
                    </AnimatePresence>

                    <button
                      type="button"
                      onClick={togglePlay}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 font-mono text-[10px] text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
                      title={isPlaying ? "Pause video" : "Play video"}
                    >
                      {isPlaying ? (
                        <Pause className="h-3 w-3" />
                      ) : (
                        <Play className="h-3 w-3" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={restartVideo}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 font-mono text-[10px] text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
                      title="Restart video"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Muted Autoplay Product Explainer Video */}
                <div className="relative aspect-video w-full overflow-hidden bg-black">
                  <video
                    ref={videoRef}
                    src="/salesient-explainer.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="h-full w-full object-cover"
                  />
                  {/* Subtle edge vignette */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 shadow-[inset_0_0_36px_rgba(5,5,7,0.65)]"
                  />
                  {/* Continuous Thin Progress Line at Bottom of Video */}
                  <div className="absolute inset-x-0 bottom-0 h-[2px] bg-white/10">
                    <div
                      className="h-full bg-emerald-400 transition-all duration-150 ease-linear"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Integrated 3-Pill Interactive Scrubber Bar Inside Frame Footer */}
                <div className="grid grid-cols-3 divide-x divide-white/[0.06] border-t border-white/[0.07] bg-[#08080c]">
                  {videoPhases.map((phase, idx) => {
                    const isActive = activePhase === idx;
                    return (
                      <button
                        key={phase.id}
                        type="button"
                        onClick={() => seekToPhase(idx)}
                        className={cn(
                          "group flex cursor-pointer items-center gap-2 px-3 py-2.5 text-left transition-colors",
                          isActive
                            ? "bg-emerald-500/[0.08] text-white"
                            : "text-zinc-500 hover:bg-white/[0.02] hover:text-zinc-300"
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded font-mono text-[10px] font-semibold",
                            isActive
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-white/[0.04] text-zinc-500"
                          )}
                        >
                          {phase.step}
                        </span>
                        <span className="truncate font-medium text-[11px]">
                          {phase.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            BOTTOM ARCHITECTURAL TELEMETRY STRIP (LEFT/RIGHT STAGGERED MOTION)
           ═══════════════════════════════════════════════════════════════════ */}
        <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.08] md:mt-20 lg:grid-cols-4">
          {telemetryMetrics.map((metric, idx) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, x: idx < 2 ? -24 : 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: idx * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex flex-col justify-between bg-[#070709] p-5 sm:p-6"
            >
              <p className="font-semibold text-2xl tracking-tight text-white sm:text-3xl">
                {metric.value}
              </p>
              <div className="mt-2">
                <p className="font-medium text-xs text-zinc-200 sm:text-sm">
                  {metric.label}
                </p>
                <p className="mt-0.5 text-[11px] text-zinc-500">
                  {metric.detail}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
