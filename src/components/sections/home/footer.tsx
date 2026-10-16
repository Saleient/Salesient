"use client";

import Link from "next/link";
import { SalesientLogo } from "@/components/sections/home/navbar";

const productLinks = [
  { label: "Overview", href: "/" },
  { label: "Architecture", href: "/#features" },
  { label: "Integrations (120+)", href: "/integration" },
  { label: "Pricing", href: "/pricing" },
];

const resourceLinks = [
  { label: "FAQ", href: "/faq" },
  { label: "Contact Support", href: "/contact" },
  { label: "Workspace Sign In", href: "/login" },
];

const securitySpecs = [
  "SOC 2 Type II Controls",
  "GDPR Art. 28 Compliant",
  "ISO 27001 Certified Infra",
  "Zero Model Training Policy",
];

export default function Footer() {
  return (
    <footer
      id="footer"
      className="border-t border-white/[0.07] bg-[#050507] px-4 pt-16 pb-12 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-10 pb-12 md:grid-cols-12">
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-5">
            <SalesientLogo />
            <p className="max-w-sm text-xs text-zinc-400 leading-relaxed sm:text-sm">
              Contextual revenue intelligence grounded in your documents and
              CRM. Sub-second hybrid RAG with verifiable page-and-clause
              citations.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 text-[11px] text-zinc-400">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              <span>All RAG &amp; Ingestion Clusters Operational</span>
            </div>
          </div>

          {/* Product Column */}
          <div className="md:col-span-2">
            <h3 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Platform
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs sm:text-sm">
              {productLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-zinc-400 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Column */}
          <div className="md:col-span-2">
            <h3 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Resources
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs sm:text-sm">
              {resourceLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-zinc-400 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Governance Column */}
          <div className="md:col-span-3">
            <h3 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Trust &amp; Governance
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs text-zinc-400">
              {securitySpecs.map((spec) => (
                <li key={spec} className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-white" />
                  <span>{spec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 text-xs text-zinc-500 sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} Salesient Inc. All rights
            reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/contact"
              className="transition-colors hover:text-zinc-300"
            >
              Contact
            </Link>
            <Link href="/faq" className="transition-colors hover:text-zinc-300">
              FAQ
            </Link>
            <Link
              href="/pricing"
              className="transition-colors hover:text-zinc-300"
            >
              Pricing
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
