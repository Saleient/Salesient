"use client";

import { type HTMLMotionProps, motion } from "motion/react";
import Link from "next/link";
import * as React from "react";
import { TextLoop } from "@/components/motion-primitives/text-loop";
import { cn } from "@/lib/utils";

interface GradientCardProps extends HTMLMotionProps<"div"> {
  children: [React.ReactNode, React.ReactNode]; // exactly 2 texts
  borderWidth?: number;
  href?: string; // optional link
  target?: string; // optional target for external links
}

export function GradientCard({
  children,
  className,
  borderWidth = 2,
  href,
  target,
  ...props
}: GradientCardProps) {
  const [hovered, setHovered] = React.useState(false);
  const [triggerFlip, setTriggerFlip] = React.useState(false);

  const handleHoverStart = React.useCallback(() => {
    if (!hovered) {
      setHovered(true);
      setTriggerFlip(true);
    }
  }, [hovered]);

  const handleHoverEnd = React.useCallback(() => {
    if (hovered) {
      setHovered(false);
      setTriggerFlip(true);
    }
  }, [hovered]);

  React.useEffect(() => {
    if (triggerFlip) {
      const timer = setTimeout(() => setTriggerFlip(false), 100);
      return () => clearTimeout(timer);
    }
  }, [triggerFlip]);

  const content = (
    <div className="min-w-[140px] rounded-full bg-[radial-gradient(70%_70%_at_50%_50%,#1a1b1c_0%,#151515_100%)] px-4 py-3 text-center font-medium text-sm text-white backdrop-opacity-40 sm:min-w-[180px] sm:px-8 sm:py-4 sm:text-lg md:min-w-[200px] md:px-12 md:text-lg">
      <div className="relative inline-block">
        <div className="absolute opacity-0">{children[0]}</div>
        <TextLoop
          className="cursor-pointer"
          interval={0.5}
          singleStep={true}
          trigger={triggerFlip}
        >
          {children[0]}
          {children[1]}
        </TextLoop>
      </div>
    </div>
  );

  const cardContent = href ? (
    <Link className="block" href={href} target={target}>
      {content}
    </Link>
  ) : (
    content
  );

  return (
    <motion.div
      animate={{
        background: hovered
          ? "linear-gradient(270deg, rgba(255,0,0,0.6) 0%, rgba(143,0,255,0.6) 100%)"
          : "linear-gradient(90deg, rgba(255,0,0,0.6) 0%, rgba(143,0,255,0.6) 100%)",
      }}
      className={cn("inline-block rounded-full p-0.5", className)}
      onHoverEnd={handleHoverEnd}
      onHoverStart={handleHoverStart}
      style={{ padding: borderWidth }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      {...props}
    >
      {cardContent}
    </motion.div>
  );
}
