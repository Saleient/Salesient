"use client";

import Lenis from "lenis";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Footer from "@/components/sections/home/footer";
import Navbar from "@/components/sections/home/navbar";
import { Button } from "@/components/ui/button";

const springSmooth = { type: "spring" as const, stiffness: 120, damping: 20 };

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
        <motion.div
          className="group relative mx-auto flex h-full w-full max-w-360 flex-col items-center justify-center gap-5 overflow-hidden rounded-2xl border border-white/6 bg-linear-to-b from-white/3 to-transparent px-6 py-20 text-center transition-colors duration-700 hover:border-white/10 md:p-32"
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
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-[0.015]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <motion.div
            className="z-10 mb-2 flex items-center gap-2 rounded-full border border-white/10 bg-white/3 px-4 py-1.5 text-xs text-white/40 uppercase tracking-widest"
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
              transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY }}
            />
            Ready to Start
          </motion.div>
          <motion.h2
            className="z-10 font-bold text-3xl leading-tight tracking-tighter sm:text-5xl md:max-w-5xl md:font-semibold md:text-7xl"
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
              Stop Searching. Start Closing.
            </span>
          </motion.h2>
          <motion.p
            className="z-10 mt-1 max-w-xl text-base text-white/35 md:text-lg"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35, duration: 0.5 }}
          >
            Your AI-powered sales intelligence platform — ready when you are.
          </motion.p>
          <motion.div
            className="z-10 mt-6 flex items-center gap-4"
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
              className="group flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white/60"
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
        </motion.div>
      </section>
      <Footer />
    </>
  );
}
