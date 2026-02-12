"use client";

import { Menu } from "lucide-react";
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

export default function Navbar() {
  const [isDarkBackground, setIsDarkBackground] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // For pricing and FAQ pages, always use dark background
    const shouldUseDarkBackground =
      pathname === "/pricing" ||
      pathname === "/faq" ||
      pathname === "/integration";

    if (shouldUseDarkBackground) {
      setIsDarkBackground(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target.id === "quote") {
            // Once we cross the quote section, stay dark until the end
            if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
              setIsDarkBackground(true);
            } else {
              setIsDarkBackground(false);
            }
          }
        });
      },
      {
        threshold: 0, // Trigger as soon as any part is visible
        rootMargin: "-10% 0px -10% 0px", // Add some margin to trigger earlier
      }
    );

    // Observe the quote section
    const quoteSection = document.getElementById("quote");
    if (quoteSection) {
      observer.observe(quoteSection);
    }

    return () => {
      if (quoteSection) {
        observer.unobserve(quoteSection);
      }
    };
  }, [pathname]);

  const navbarClasses = isDarkBackground
    ? "fixed  w-full flex items-center justify-between px-10 py-6 z-40 bg-background transition-all duration-300"
    : "fixed w-full flex items-center justify-between px-10 py-6 z-40 bg-foreground transition-all duration-300";

  const textClasses = isDarkBackground ? "text-foreground" : "text-neutral-950";

  const linkClasses = isDarkBackground
    ? "text-foreground/80 hover:text-foreground transition font-semibold text-lg"
    : "text-neutral-950/80 hover:text-neutral-950 transition font-semibold text-lg";

  const mobileIconClasses = isDarkBackground
    ? "text-foreground"
    : "text-neutral-950";

  return (
    <nav className={navbarClasses}>
      <div className="mx-auto flex w-full max-w-[1440px] flex-row justify-between">
        <Link
          className={`${textClasses} w-fit font-bold text-xl tracking-tight`}
          href="/"
        >
          SALESORBIT
        </Link>

        {/* Desktop Links */}
        <div className="hidden space-x-6 md:flex">
          <Link className={linkClasses} href="/">
            Home
          </Link>
          <Link className={linkClasses} href="/pricing">
            Pricing
          </Link>
          <Link className={linkClasses} href="/faq">
            FAQ
          </Link>
          <Link className={linkClasses} href="/integration">
            Integrations
          </Link>
        </div>

        <Link
          className="hidden cursor-pointer rounded-full bg-linear-to-b from-[#636363] to-[#2D2E2F] p-px md:block"
          href="/login"
        >
          <Button className="hidden cursor-pointer rounded-full text-white md:inline-flex">
            Lets Get Started!
          </Button>{" "}
        </Link>
      </div>

      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button className={mobileIconClasses} size="icon" variant="ghost">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent
            className={`w-[280px] border-l p-6 ${
              isDarkBackground
                ? "border-foreground/20 bg-background"
                : "border-neutral-200 bg-white"
            }`}
            side="right"
          >
            <SheetHeader className="mb-8">
              <SheetTitle
                className={`text-left font-bold text-xl tracking-tight ${textClasses}`}
              >
                SALESORBIT
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col space-y-6">
              <Link className={linkClasses} href="/">
                Home
              </Link>
              <Link className={linkClasses} href="/pricing">
                Pricing
              </Link>
              <Link className={linkClasses} href="/faq">
                FAQ
              </Link>
              <Link className={linkClasses} href="/integration">
                Integrations
              </Link>
            </div>

            <div className="mt-8">
              <Link
                className="block cursor-pointer rounded-full bg-linear-to-b from-[#636363] to-[#2D2E2F] p-px"
                href="/login"
              >
                <Button className="w-full cursor-pointer rounded-full text-white">
                  Lets Get Started!
                </Button>
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
