"use client";

import Lenis from "lenis";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
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
      lerp: 0.2,
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
    <>
      <Navbar />
      {children}

      {/* ── High-Impact Closing CTA ── */}
      <section
        className="relative flex flex-col items-center justify-center overflow-hidden bg-black px-4 py-20 sm:px-6 md:py-28 lg:px-8"
        id="cta"
      >
        <div className="z-10 mx-auto flex w-full max-w-4xl flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-6"
          >
            <h2 className="max-w-3xl text-balance font-semibold text-3xl tracking-tight text-white sm:text-5xl md:text-6xl">
              Turn every sales signal into
              <br />
              <span className="text-zinc-500">revenue action.</span>
            </h2>

            <p className="max-w-xl text-balance text-base text-zinc-400 leading-relaxed sm:text-lg">
              Equip your sales team with real-time, citation-backed answers,
              decision-ready briefings, and faster deal velocity across every
              conversation.
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
              <Button
                size="lg"
                className="group cursor-pointer rounded-full bg-white px-8 py-6 text-base font-semibold text-black transition-all hover:bg-zinc-200"
                onClick={() => router.push("/login")}
                type="button"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>

              <Link href="/pricing">
                <Button
                  variant="outline"
                  size="lg"
                  className="cursor-pointer rounded-full border-white/10 bg-white/[0.02] px-7 py-6 text-base text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
                >
                  View Pricing
                </Button>
              </Link>
            </div>

            {/* Reassurance points */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400">
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>Instant 2-minute setup</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>No credit card required</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>SOC 2 Type II compliant</span>
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
}
