"use client";

import Lenis from "lenis";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Footer from "@/components/sections/home/footer";
import Navbar from "@/components/sections/home/navbar";
import { Button } from "@/components/ui/button";

const springSmooth = { type: "spring" as const, stiffness: 120, damping: 20 };
const ctaBenefits = [
  "Centralized AI-ready sales knowledge",
  "Contextual answers with reliable citations",
  "Faster prep for every revenue conversation",
];

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
      <section
        className="flex flex-col items-center justify-center bg-black px-5 py-12 sm:px-10 sm:py-16 md:py-24"
        id="cta"
      >
        <motion.div
          className="group relative mx-auto w-full max-w-360 overflow-hidden rounded-3xl border border-white/8 bg-linear-to-b from-white/4 to-transparent px-6 py-10 transition-colors duration-700 hover:border-white/12 md:px-12 md:py-14"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ ...springSmooth }}
        >
          {/* Breathing radial glow */}
          <motion.div
            className="pointer-events-none absolute top-0 left-1/2 h-125 w-200 -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)]"
            animate={{ scale: [1, 1.06, 1], opacity: [0.7, 1, 0.7] }}
            transition={{
              duration: 6,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />

          {/* Grid pattern */}
          <div
            className="pointer-events-none absolute inset-0 rounded-3xl opacity-[0.015]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative z-10 grid gap-8 md:grid-cols-[1.25fr_0.75fr] md:gap-10">
            <div className="text-left md:text-left">
              <motion.div
                className="mb-4 flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/3 px-4 py-1.5 text-xs text-white/40 uppercase tracking-widest"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, ...springSmooth }}
              >
                <motion.span
                  className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"
                  animate={{
                    boxShadow: [
                      "0 0 4px rgba(16,185,129,0.4)",
                      "0 0 10px rgba(16,185,129,0.7)",
                      "0 0 4px rgba(16,185,129,0.4)",
                    ],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                />
                Ready to Start
              </motion.div>

              <motion.h2
                className="max-w-4xl text-balance font-semibold text-3xl leading-tight tracking-[-0.02em] sm:text-5xl md:text-6xl"
                initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true }}
                transition={{
                  delay: 0.2,
                  ...springSmooth,
                  filter: { duration: 0.6 },
                }}
              >
                <span className="bg-linear-to-b from-white to-white/50 bg-clip-text text-transparent">
                  Turn Every Sales Signal Into Revenue Action.
                </span>
              </motion.h2>

              <motion.p
                className="mt-4 max-w-2xl text-base text-white/38 leading-relaxed md:text-lg"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.35, duration: 0.5 }}
              >
                Salesient gives your team context-rich answers, decision-ready
                documentation, and faster execution across every deal stage.
              </motion.p>

              <motion.div
                className="mt-7 flex flex-wrap items-center gap-4"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, ...springSmooth }}
              >
                <motion.div
                  className="rounded-full bg-linear-to-b from-[#636363] to-[#2D2E2F] p-0.5"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <Button
                    className="cursor-pointer p-4 text-base md:p-6 md:text-[18px]"
                    onClick={() => router.push("/login")}
                    type="button"
                  >
                    Get Started
                  </Button>
                </motion.div>

                <motion.a
                  className="group flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white/65"
                  href="/pricing"
                  whileHover={{ x: 2 }}
                >
                  View Pricing
                  <motion.span
                    className="inline-block"
                    animate={{ x: [0, 3, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  >
                    →
                  </motion.span>
                </motion.a>
              </motion.div>
            </div>

            <motion.aside
              className="rounded-2xl border border-white/8 bg-white/2 p-5 text-left md:p-6"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <p className="text-white/60 text-xs tracking-widest uppercase">
                What You Unlock
              </p>
              <ul className="mt-4 space-y-3">
                {ctaBenefits.map((benefit) => (
                  <li
                    className="flex items-start gap-2 text-sm text-white/45 leading-relaxed"
                    key={benefit}
                  >
                    <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-white/45" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </motion.aside>
          </div>
        </motion.div>
      </section>
      <Footer />
    </>
  );
}
