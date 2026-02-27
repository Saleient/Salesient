"use client";

import Lenis from "lenis";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Footer from "@/components/sections/home/footer";
import Navbar from "@/components/sections/home/navbar";
import { Button } from "@/components/ui/button";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.2, // smoothness (0–1), lower = smoother
      wheelMultiplier: 1, // scroll speed multiplier
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  const router = useRouter();

  return (
    <>
      <Navbar />
      {children}
      <section
        className="flex flex-col items-center justify-center bg-black px-5 py-12 sm:px-10 sm:py-16 md:py-24"
        id="cta"
      >
        <div className="relative mx-auto flex h-full w-full max-w-[1440px] flex-col items-center justify-center gap-5 overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent px-6 py-20 text-center md:p-32">
          {/* Subtle radial glow */}
          <div className="pointer-events-none absolute top-0 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)]" />
          {/* Grid pattern */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-[0.015]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="z-10 mb-2 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs text-white/40 uppercase tracking-widest">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
            Ready to Start
          </div>
          <h1 className="z-10 font-bold text-3xl leading-tight tracking-tighter sm:text-5xl md:max-w-5xl md:font-semibold md:text-7xl">
            <span className="bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
              Stop Searching. Start Closing.
            </span>
          </h1>
          <p className="z-10 mt-1 max-w-xl text-base text-white/35 md:text-lg">
            Your AI-powered sales intelligence platform — ready when you are.
          </p>
          <div className="z-10 mt-6 flex items-center gap-4">
            <div className="rounded-full bg-linear-to-b from-[#636363] to-[#2D2E2F] p-0.5">
              <Button
                className="cursor-pointer p-4 text-base md:p-6 md:text-[18px]"
                onClick={() => router.push("/login")}
              >
                Get Started
              </Button>
            </div>
            <a
              className="group flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white/60"
              href="/pricing"
            >
              View Pricing
              <span className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </a>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
