"use client";
import {
  motion,
  type Transition,
  type UseInViewOptions,
  useInView,
  type Variant,
} from "motion/react";
import { type ReactNode, useRef, useState } from "react";

export type InViewProps = {
  children: ReactNode;
  variants?: {
    hidden: Variant;
    visible: Variant;
  };
  transition?: Transition;
  viewOptions?: UseInViewOptions;
  as?: React.ElementType;
  once?: boolean;
  className?: string;
};

// ✨ Default fade-in + blur effect
const defaultVariants = {
  hidden: { opacity: 0, y: 40, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export function InView({
  children,
  variants = defaultVariants,
  transition = { duration: 0.5, ease: "easeOut" },
  viewOptions,
  as = "div",
  once = true, // ✅ default set to true
  className = "",
}: InViewProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, viewOptions);

  const [isViewed, setIsViewed] = useState(false);

  const MotionComponent = motion[as as keyof typeof motion] as typeof as;

  return (
    <MotionComponent
      animate={isInView || isViewed ? "visible" : "hidden"}
      className={`w-full ${className}`}
      initial="hidden"
      onAnimationComplete={() => {
        if (once) {
          setIsViewed(true);
        }
      }}
      ref={ref}
      transition={transition}
      variants={variants}
    >
      {children}
    </MotionComponent>
  );
}
