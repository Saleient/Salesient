"use client";

import { useEffect, useState } from "react";
import Hero from "@/components/sections/home/hero";

export default function ParallaxHero() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const newScale = 1 + window.scrollY * 0.0003;
      setScale(newScale > 1.2 ? 1.2 : newScale);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="-z-10 fixed inset-0 h-full w-full will-change-transform"
      style={{
        transform: `scale(${scale})`,
        transition: "transform 0.05s linear",
      }}
    >
      <Hero />
    </div>
  );
}
