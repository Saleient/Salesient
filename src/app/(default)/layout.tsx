"use client";

import Lenis from "lenis";
import Image from "next/image";
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
        className="flex flex-col items-center justify-center bg-background px-5 py-12 sm:px-10 sm:py-16 md:py-24"
        id="cta"
      >
        <div className="relative mx-auto flex h-full w-full max-w-[1440px] flex-col items-center justify-center gap-2 overflow-x-hidden rounded-2xl border border-white/40 bg-black px-3 py-20 text-center md:p-32">
          <Image
            alt="Background"
            className="absolute inset-0 z-0 h-full w-full object-cover opacity-65"
            fill
            priority
            src="/bg.png"
          />
          <h1 className="z-10 font-bold text-3xl text-white/90 leading-tighter tracking-tighter sm:text-5xl md:max-w-5xl md:font-semibold md:text-7xl">
            Stop searching through sales docs. Start closing deals
          </h1>
          <div className="z-10 mt-6 rounded-full bg-linear-to-b from-[#636363] to-[#2D2E2F] p-0.5">
            <Button
              className="cursor-pointer p-4 text-base md:p-6 md:text-[18px]"
              onClick={() => router.push("/login")}
            >
              Try It Out!
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
