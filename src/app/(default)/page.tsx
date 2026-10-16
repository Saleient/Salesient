"use client";

import Features from "@/components/sections/home/features";
import Hero from "@/components/sections/home/hero";
import Integration from "@/components/sections/home/integrations";
import Security from "@/components/sections/home/security";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050507]">
      <Hero />
      <Features />
      <Integration />
      <Security />
    </main>
  );
}
