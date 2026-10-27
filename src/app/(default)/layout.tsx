"use client";

import Lenis from "lenis";
import { ArrowRight } from "lucide-react";
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

      {/* ── Clean Closing CTA ── */}
      <section
        className="relative overflow-hidden bg-[#050507] px-4 py-20 sm:px-6 md:py-24 lg:px-8"
        id="cta"
      >
        <div className="mx-auto w-full max-w-7xl">
          <motion.div
            className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#09090c] px-6 py-16 text-center sm:px-12 md:py-20"
            initial={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center">
              <h2 className="text-balance font-semibold text-3xl text-white tracking-[-0.025em] sm:text-5xl">
                Turn every sales signal into{" "}
                <span className="text-zinc-500">verified deal action.</span>
              </h2>

              <p className="mt-4 max-w-xl text-balance text-sm text-zinc-400 leading-relaxed sm:text-base">
                Equip your team with instant, citation-backed deal answers,
                automated briefings, and live CRM context.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button
                  className="group h-11 cursor-pointer rounded-full bg-white px-6 font-semibold text-black text-sm transition-all hover:bg-zinc-200"
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
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
