"use client";

import { Menu } from "lucide-react";
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
  { label: "Home", href: "/" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/faq" },
  { label: "Integrations", href: "/integration" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const isHome = pathname === "/";
  const shouldElevate = !isHome || isScrolled;

  const linkClass = (href: string) =>
    cn(
      "relative py-1 text-sm font-medium tracking-wide transition-colors duration-300 after:absolute after:-bottom-0.5 after:left-0 after:h-px after:bg-white/60 after:transition-all after:duration-300",
      pathname === href
        ? "text-white after:w-full"
        : "text-white/60 hover:text-white/90 after:w-0 hover:after:w-full"
    );

  const ctaClass = cn(
    "block rounded-full bg-linear-to-b p-px transition-transform duration-300 hover:scale-[1.01]",
    "from-[#636363] to-[#2D2E2F]"
  );

  return (
    <nav className="fixed inset-x-0 top-0 z-50 px-4 py-3 sm:px-6 md:px-8">
      <motion.div
        animate={{ y: 0, opacity: 1 }}
        initial={{ y: -16, opacity: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className={cn(
            "mx-auto flex w-full max-w-360 items-center justify-between px-4 py-3 transition-all duration-500 md:px-6",
            shouldElevate
              ? "rounded-2xl border border-white/10 bg-black/80 shadow-[0_12px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl"
              : "rounded-2xl border border-transparent bg-black/10 backdrop-blur-sm"
          )}
        >
          <Link
            className="w-fit font-bold text-white text-xl tracking-tight"
            href="/"
          >
            SALESIENT
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            {navItems.map((item) => (
              <Link
                className={linkClass(item.href)}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:block">
            <Link className={ctaClass} href="/login">
              <Button
                className="cursor-pointer rounded-full text-white"
                type="button"
              >
                Get Started
              </Button>
            </Link>
          </div>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  className="text-white"
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                className="w-70 border-white/10 border-l bg-black/95 p-6 backdrop-blur-xl"
                side="right"
              >
                <SheetHeader className="mb-8">
                  <SheetTitle className="text-left font-bold text-white text-xl tracking-tight">
                    SALESIENT
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col space-y-6">
                  {navItems.map((item) => (
                    <Link
                      className={linkClass(item.href)}
                      href={item.href}
                      key={item.href}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                <div className="mt-8">
                  <Link className={ctaClass} href="/login">
                    <Button
                      className="w-full cursor-pointer rounded-full text-white"
                      type="button"
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </motion.div>
    </nav>
  );
}
