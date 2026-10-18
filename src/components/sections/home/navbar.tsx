"use client";

import { ArrowUpRight, Menu } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Overview", href: "/" },
  { label: "Integrations", href: "/integration" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export function SalesientLogo({ className }: { className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/15 bg-black shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
        {/** biome-ignore lint/performance/noImgElement: brand mark */}
        {/** biome-ignore lint/correctness/useImageSize: CSS sized */}
        <img
          alt="Salesient Logo"
          className="h-full w-full object-contain p-0.5"
          src="/salesient-mark.png"
        />
      </div>
      {/** biome-ignore lint/performance/noImgElement: brand wordmark */}
      {/** biome-ignore lint/correctness/useImageSize: CSS sized */}
      <img
        alt="SALESIENT"
        className="h-3.5 w-auto object-contain tracking-wider opacity-95"
        src="/salesient-wordmark.png"
      />
    </div>
  );
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 16);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3.5 sm:px-6 lg:px-8">
      <motion.div
        animate={{ y: 0, opacity: 1 }}
        className="mx-auto max-w-6xl"
        initial={{ y: -14, opacity: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className={cn(
            "flex items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-300 sm:px-5",
            isScrolled
              ? "border border-white/[0.09] bg-[#070709]/85 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl"
              : "border border-white/[0.05] bg-[#070709]/50 backdrop-blur-md"
          )}
        >
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Link className="group focus:outline-none" href="/">
              <SalesientLogo />
            </Link>
          </div>

          {/* Center Navigation Pill */}
          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.02] p-1 md:flex"
          >
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  className={cn(
                    "relative rounded-full px-3.5 py-1.5 font-medium text-xs transition-colors duration-200",
                    isActive
                      ? "text-white"
                      : "text-zinc-400 hover:text-zinc-200"
                  )}
                  href={item.href}
                  key={item.href}
                >
                  {isActive && (
                    <motion.span
                      className="absolute inset-0 rounded-full border border-white/10 bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                      layoutId="navbar-active-pill"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 32,
                      }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right CTAs */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              className="px-2.5 py-1.5 font-medium text-xs text-zinc-400 transition-colors hover:text-white"
              href="/login"
            >
              Sign in
            </Link>
            <Link href="/login">
              <Button
                className="group h-8 cursor-pointer rounded-full bg-white px-4 font-semibold text-black text-xs shadow-[0_1px_12px_rgba(255,255,255,0.15)] transition-all hover:bg-zinc-200"
                size="sm"
                type="button"
              >
                <span>Open Workspace</span>
                <ArrowUpRight className="group-hover:-translate-y-0.5 ml-1 h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Button>
            </Link>
          </div>

          {/* Mobile Drawer */}
          <div className="md:hidden">
            <Sheet onOpenChange={setMobileOpen} open={mobileOpen}>
              <SheetTrigger asChild>
                <Button
                  aria-label="Open navigation menu"
                  className="h-8 w-8 rounded-lg border border-white/10 bg-white/[0.03] text-zinc-200 hover:bg-white/[0.08]"
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent
                className="w-72 border-white/10 border-l bg-[#070709]/95 p-6 backdrop-blur-2xl"
                side="right"
              >
                <SheetHeader className="mb-8 border-white/[0.06] border-b pb-4">
                  <SheetTitle className="text-left">
                    <SalesientLogo />
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-1.5">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        className={cn(
                          "flex items-center justify-between rounded-xl px-3.5 py-2.5 font-medium text-sm transition-colors",
                          isActive
                            ? "border border-white/10 bg-white/[0.06] text-white"
                            : "text-zinc-400 hover:bg-white/[0.03] hover:text-white"
                        )}
                        href={item.href}
                        key={item.href}
                        onClick={() => setMobileOpen(false)}
                      >
                        <span>{item.label}</span>
                        {isActive && (
                          <span className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-8 flex flex-col gap-2.5 border-white/[0.06] border-t pt-6">
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button
                      className="w-full cursor-pointer rounded-full bg-white py-2.5 font-semibold text-black text-xs hover:bg-zinc-200"
                      type="button"
                    >
                      Open Workspace
                      <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </motion.div>
    </header>
  );
}
