"use client";

import { motion } from "motion/react";
import Link from "next/link";

const springSmooth = { type: "spring" as const, stiffness: 120, damping: 20 };

// -- Footer link data
const navLinks = [
  { label: "Home", href: "/" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/faq" },
  { label: "Integrations", href: "/integration" },
];

const resourceLinks = [
  { label: "Features", href: "/pricing#features" },
  { label: "Contact Support", href: "/contact" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "#", disabled: true },
  { label: "Terms of Service", href: "#", disabled: true },
];

// -- Animated footer link component
function FooterLink({
  href,
  children,
  disabled,
}: {
  href: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <span className="cursor-not-allowed text-white/30" title="Coming soon">
        {children}
      </span>
    );
  }

  return (
    <Link
      className="group relative text-white/60 transition-colors hover:text-white"
      href={href}
    >
      {children}
      <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-white/40 transition-all duration-300 group-hover:w-full" />
    </Link>
  );
}

export default function Footer() {
  return (
    <section className="z-10 w-full bg-black" id="footer">
      <footer className="mx-auto max-w-360 px-6 pt-16 pb-8 text-gray-300">
        {/* Top separator */}
        <motion.div
          className="mb-12 h-px w-full bg-linear-to-r from-transparent via-white/10 to-transparent"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
        />

        <div className="mx-auto max-w-360">
          {/* Header Section */}
          <motion.div
            className="mb-12 flex flex-col gap-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...springSmooth }}
          >
            <h2 className="font-bold text-xl tracking-tight text-white">
              SALESIENT
            </h2>
            <p className="max-w-sm text-sm text-white/40 leading-relaxed">
              AI-powered sales intelligence — transforming data into revenue.
            </p>
          </motion.div>

          {/* Mobile Layout */}
          <div className="md:hidden">
            <div className="grid grid-cols-2 gap-10">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, ...springSmooth }}
              >
                <h3 className="mb-4 font-medium text-xs tracking-widest text-white/50 uppercase">
                  Navigation
                </h3>
                <ul className="space-y-3 text-sm">
                  {navLinks.map(({ label, href }) => (
                    <li key={label}>
                      <FooterLink href={href}>{label}</FooterLink>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, ...springSmooth }}
              >
                <h3 className="mb-4 font-medium text-xs tracking-widest text-white/50 uppercase">
                  Resources
                </h3>
                <ul className="space-y-3 text-sm">
                  {resourceLinks.map(({ label, href }) => (
                    <li key={label}>
                      <FooterLink href={href}>{label}</FooterLink>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden gap-16 md:grid md:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, ...springSmooth }}
            >
              <h3 className="mb-5 font-medium text-xs tracking-widest text-white/50 uppercase">
                About
              </h3>
              <p className="text-sm text-white/40 leading-relaxed">
                Enterprise sales intelligence platform that transforms your data
                into actionable insights, maps your pipeline, and drives
                measurable revenue outcomes.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, ...springSmooth }}
            >
              <h3 className="mb-5 font-medium text-xs tracking-widest text-white/50 uppercase">
                Navigation
              </h3>
              <ul className="space-y-3 text-sm">
                {navLinks.map(({ label, href }) => (
                  <li key={label}>
                    <FooterLink href={href}>{label}</FooterLink>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, ...springSmooth }}
            >
              <h3 className="mb-5 font-medium text-xs tracking-widest text-white/50 uppercase">
                Resources
              </h3>
              <ul className="space-y-3 text-sm">
                {resourceLinks.map(({ label, href }) => (
                  <li key={label}>
                    <FooterLink href={href}>{label}</FooterLink>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, ...springSmooth }}
            >
              <h3 className="mb-5 font-medium text-xs tracking-widest text-white/50 uppercase">
                Legal
              </h3>
              <ul className="space-y-3 text-sm">
                {legalLinks.map(({ label, href, disabled }) => (
                  <li key={label}>
                    <FooterLink disabled={disabled} href={href}>
                      {label}
                    </FooterLink>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Large Brand Watermark */}
        <motion.div
          className="relative mt-16 overflow-hidden md:mt-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          {/* Ambient watermark glow */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-32 w-96 rounded-full bg-white/2 blur-[100px]" />
          </div>
          <p
            aria-hidden="true"
            className="select-none text-center font-bold text-[clamp(4rem,15vw,12rem)] tracking-tighter text-white/3 leading-none"
          >
            SALESIENT
          </p>
        </motion.div>

        {/* Bottom bar */}
        <motion.div
          className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 md:flex-row"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} Salesient. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <FooterLink href="/contact">
              <span className="text-xs">Support</span>
            </FooterLink>
            <span className="text-white/10">&middot;</span>
            <FooterLink href="/faq">
              <span className="text-xs">FAQ</span>
            </FooterLink>
          </div>
        </motion.div>
      </footer>
    </section>
  );
}
