"use client";

import Lenis from "lenis";
import { ArrowRight, Check } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
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
      lerp: 0.14,
      wheelMultiplier: 1,
    });

    let rafId = 0;

    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#050507] text-white">
      <Navbar />
      {children}

      {/* ── Architectural Closing CTA ── */}
      <section
        className="relative overflow-hidden bg-[#050507] px-4 py-20 sm:px-6 md:py-28 lg:px-8"
        id="cta"
      >
        <div className="mx-auto max-w-6xl">
          <motion.div
            className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#09090c] px-6 py-16 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:px-12 md:py-20"
            initial={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            {/* Subtle background grid & top spotlight */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-grid-subtle [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_20%,transparent_100%)]"
            />
            <div
              aria-hidden="true"
              className="-top-32 -translate-x-1/2 pointer-events-none absolute left-1/2 h-64 w-[520px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08)_0%,transparent_70%)] blur-2xl"
            />

            <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[11px] text-zinc-400 uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Deploy in 2 Minutes
              </span>

              <h2 className="text-balance font-semibold text-3xl text-white tracking-[-0.025em] sm:text-5xl">
                Turn every sales signal into{" "}
                <span className="text-zinc-500">verified revenue action.</span>
              </h2>

              <p className="mt-4 max-w-xl text-balance text-sm text-zinc-400 leading-relaxed sm:text-base">
                Equip your team with sub-second, citation-backed deal answers,
                automated executive briefings, and live CRM context.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
                <Button
                  className="group h-11 cursor-pointer rounded-full bg-white px-7 font-semibold text-black text-sm shadow-[0_0_25px_rgba(255,255,255,0.16)] transition-all hover:bg-zinc-200"
                  onClick={() => router.push("/contact?plan=pro")}
                  size="lg"
                  type="button"
                >
                  Buy Pro Plan
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Button>

                <Button
                  className="h-11 cursor-pointer rounded-full border-white/15 bg-white/[0.05] px-6 font-medium text-sm text-white transition-colors hover:border-white/25 hover:bg-white/[0.09]"
                  onClick={() => router.push("/login")}
                  size="lg"
                  type="button"
                  variant="outline"
                >
                  Start Free Workspace
                </Button>

                <Link href="/pricing">
                  <Button
                    className="h-11 cursor-pointer rounded-full border-white/10 bg-white/[0.02] px-6 font-medium text-sm text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                    size="lg"
                    variant="outline"
                  >
                    Compare Plans
                  </Button>
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400">
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Instant OAuth 2.0 setup</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>14-day 100% refund guarantee</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>SOC 2 &amp; GDPR ready</span>
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
