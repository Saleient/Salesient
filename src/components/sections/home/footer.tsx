"use client";

import Link from "next/link";
import { SalesientLogo } from "@/components/sections/home/navbar";

const productLinks = [
  { label: "Overview", href: "/" },
  { label: "How It Works", href: "/#features" },
  { label: "Integrations", href: "/integration" },
  { label: "Pricing", href: "/pricing" },
];

const resourceLinks = [
  { label: "Buy Pro Plan", href: "/contact?plan=pro" },
  { label: "Refund Policy", href: "/pricing#refund-policy" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
  { label: "Sign In", href: "/login" },
];

const securitySpecs = [
  "SOC 2 Type II",
  "GDPR Compliant",
  "ISO 27001",
  "14-Day Refund Guarantee",
];

export default function Footer() {
  return (
    <footer
      className="border-white/[0.07] border-t bg-[#050507] px-4 pt-16 pb-12 sm:px-6 lg:px-8"
      id="footer"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid grid-cols-1 gap-10 pb-12 md:grid-cols-12">
          {/* Brand Column */}
          <div className="space-y-3 md:col-span-5">
            <SalesientLogo />
            <p className="max-w-sm text-xs text-zinc-400 leading-relaxed sm:text-sm">
              Revenue intelligence grounded in your documents and CRM with
              verifiable page and clause citations.
            </p>
          </div>

          {/* Product Column */}
          <div className="md:col-span-2">
            <h3 className="font-mono font-semibold text-[11px] text-zinc-400 uppercase tracking-wider">
              Platform
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs sm:text-sm">
              {productLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    className="text-zinc-400 transition-colors hover:text-white"
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Column */}
          <div className="md:col-span-2">
            <h3 className="font-mono font-semibold text-[11px] text-zinc-400 uppercase tracking-wider">
              Resources
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs sm:text-sm">
              {resourceLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    className="text-zinc-400 transition-colors hover:text-white"
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Governance Column */}
          <div className="md:col-span-3">
            <h3 className="font-mono font-semibold text-[11px] text-zinc-400 uppercase tracking-wider">
              Compliance
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs text-zinc-400">
              {securitySpecs.map((spec) => (
                <li key={spec}>{spec}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-white/[0.06] border-t pt-8 text-xs text-zinc-500 sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} Salesient Inc. All rights
            reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              className="transition-colors hover:text-zinc-300"
              href="/pricing#refund-policy"
            >
              Refund Policy
            </Link>
            <Link
              className="transition-colors hover:text-zinc-300"
              href="/contact"
            >
              Contact
            </Link>
            <Link className="transition-colors hover:text-zinc-300" href="/faq">
              FAQ
            </Link>
            <Link
              className="transition-colors hover:text-zinc-300"
              href="/pricing"
            >
              Pricing
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
