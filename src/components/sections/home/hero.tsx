"use client";

import { GradientCard } from "@/components/gradient-button";

export default function Hero() {
  return (
    <section className="relative mx-auto flex flex-col items-center overflow-hidden bg-black px-4 py-10 pt-20 sm:px-5 md:min-h-screen md:px-10">
      {/* Subtle radial glow — Promptverse style */}
      <div className="pointer-events-none absolute top-0 left-1/2 h-[700px] w-[1000px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.04)_0%,transparent_70%)]" />

      {/* Decorative grid lines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Content */}
      <div className="items-left z-10 mt-16 flex w-full flex-col gap-5 sm:mt-20 sm:gap-6 md:mt-26 md:items-center">
        <div className="flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2 text-sm text-white/60 backdrop-blur-sm">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
          Salesient AI
        </div>
        <h1 className="w-full px-0 font-bold text-4xl leading-[1.05] tracking-tighter sm:max-w-7xl sm:font-medium sm:leading-none md:text-center md:text-6xl lg:text-8xl">
          <span className="bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent">
            Accelerate Revenue.
          </span>
          <br className="hidden md:block" />
          <span className="bg-gradient-to-b from-white/80 to-white/30 bg-clip-text text-transparent">
            Eliminate Document Friction.
          </span>
        </h1>

        <p className="w-full max-w-2xl font-normal text-base text-white/40 sm:px-0 sm:text-lg md:max-w-none md:text-center md:text-xl">
          Centralize proposals, playbooks, and contracts — unlock AI-driven
          insights in seconds.
        </p>

        <div className="mt-4 flex w-full items-center gap-4 px-2 sm:px-0 md:justify-center">
          <GradientCard href="/dashboard">
            <span>Start Generating ✨</span>
            <span>Get Started</span>
          </GradientCard>
          <a
            className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-6 py-2.5 text-sm text-white/60 transition-all hover:border-white/20 hover:text-white/80"
            href="/pricing"
          >
            Learn More
            <span className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
