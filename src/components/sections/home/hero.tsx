"use client";

import MuxPlayer from "@mux/mux-player-react";
import "@mux/mux-player/themes/minimal";
import Image from "next/image";
import { GradientCard } from "@/components/gradient-button";

export default function Hero() {
  return (
    <section className="relative mx-auto flex flex-col items-center overflow-hidden bg-foreground px-4 py-10 pt-20 sm:px-5 md:min-h-screen md:px-10">
      <Image
        alt="Background Image"
        className="absolute h-screen w-auto overflow-clip bg-black object-cover md:w-screen"
        height={1000}
        priority
        src={"/bg.png"}
        width={1000}
      />
      <div className="absolute h-[90%] w-screen bg-linear-to-t from-foreground via-foreground/10 to-foreground md:h-screen" />
      {/* Content */}
      <div className="items-left z-10 mt-16 flex w-full flex-col gap-4 sm:mt-20 sm:gap-6 md:mt-26 md:items-center">
        <div className="w-fit rounded-full border border-white/30 bg-white/20 px-4 py-2 text-neutral-800 shadow-lg backdrop-blur-md">
          Now Connect with your CRMs ✨
        </div>
        <h1 className="w-full bg-linear-to-br from-neutral-900 to-neutral-900/80 bg-clip-text px-0 font-bold text-4xl text-transparent leading-tight tracking-tighter sm:max-w-7xl sm:font-medium sm:leading-none md:text-center md:text-6xl lg:text-8xl">
          Close More Deals, Spend Less Time on Docs.
        </h1>

        <h3 className="w-full max-w-[90%] font-medium text-base text-neutral-900/80 sm:px-0 sm:text-lg md:max-w-none md:text-center md:text-neutral-900/70 md:text-xl">
          Upload proposals, playbooks, and contracts, get AI-powered insights in
          seconds
        </h3>

        <div className="flex w-full px-2 sm:px-0 md:justify-center">
          <GradientCard href="/dashboard">
            <span>Try It Out!</span>
            <span>Let&apos;s Go!</span>
          </GradientCard>
        </div>
        <div className="mx-auto w-full max-w-7xl rounded-2xl">
          <MuxPlayer
            autoPlay={true}
            className="aspect-video min-h-full min-w-full rounded-2xl"
            loop={true}
            muted={true}
            playbackId="00302PQmTc7fTBr6lZFCOvMdgv57z64A02SOrQrNOYT87U"
            theme="minimal"
          />
        </div>
      </div>
    </section>
  );
}
