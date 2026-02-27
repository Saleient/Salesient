import Link from "next/link";

export default function Footer() {
  return (
    <section className="z-10 w-full bg-black" id="footer">
      <footer className="mx-auto max-w-[1440px] px-6 pt-16 pb-8 text-gray-300">
        {/* Top separator */}
        <div className="mb-12 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="mx-auto max-w-[1440px]">
          {/* Header Section */}
          <div className="mb-12 flex flex-col gap-3">
            <h2 className="font-bold text-xl tracking-tight text-white">
              SALESIENT
            </h2>
            <p className="max-w-sm text-sm text-white/40 leading-relaxed">
              AI-powered sales intelligence — transforming data into revenue.
            </p>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden">
            <div className="grid grid-cols-2 gap-10">
              <div>
                <h3 className="mb-4 font-medium text-xs tracking-widest text-white/50 uppercase">
                  Navigation
                </h3>
                <ul className="space-y-3 text-sm">
                  <li>
                    <Link
                      className="text-white/60 transition-colors hover:text-white"
                      href="/"
                    >
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-white/60 transition-colors hover:text-white"
                      href="/pricing"
                    >
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-white/60 transition-colors hover:text-white"
                      href="/faq"
                    >
                      FAQ
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-white/60 transition-colors hover:text-white"
                      href="/integration"
                    >
                      Integrations
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="mb-4 font-medium text-xs tracking-widest text-white/50 uppercase">
                  Resources
                </h3>
                <ul className="space-y-3 text-sm">
                  <li>
                    <Link
                      className="text-white/60 transition-colors hover:text-white"
                      href="/pricing#features"
                    >
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-white/60 transition-colors hover:text-white"
                      href="/contact"
                    >
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden gap-16 md:grid md:grid-cols-4">
            <div>
              <h3 className="mb-5 font-medium text-xs tracking-widest text-white/50 uppercase">
                About
              </h3>
              <p className="text-sm text-white/40 leading-relaxed">
                Enterprise sales intelligence platform that transforms your data
                into actionable insights, maps your pipeline, and drives
                measurable revenue outcomes.
              </p>
            </div>

            <div>
              <h3 className="mb-5 font-medium text-xs tracking-widest text-white/50 uppercase">
                Navigation
              </h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    className="text-white/60 transition-colors hover:text-white"
                    href="/"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-white/60 transition-colors hover:text-white"
                    href="/pricing"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-white/60 transition-colors hover:text-white"
                    href="/faq"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-white/60 transition-colors hover:text-white"
                    href="/integration"
                  >
                    Integrations
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-5 font-medium text-xs tracking-widest text-white/50 uppercase">
                Resources
              </h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    className="text-white/60 transition-colors hover:text-white"
                    href="/pricing#features"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-white/60 transition-colors hover:text-white"
                    href="/contact"
                  >
                    Contact Support
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-5 font-medium text-xs tracking-widest text-white/50 uppercase">
                Legal
              </h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <span
                    className="cursor-not-allowed text-white/30"
                    title="Coming soon"
                  >
                    Privacy Policy
                  </span>
                </li>
                <li>
                  <span
                    className="cursor-not-allowed text-white/30"
                    title="Coming soon"
                  >
                    Terms of Service
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Large Brand Watermark */}
        <div className="relative mt-16 overflow-hidden md:mt-24">
          <p
            aria-hidden="true"
            className="select-none text-center font-bold text-[clamp(4rem,15vw,12rem)] tracking-tighter text-white/[0.03] leading-none"
          >
            SALESIENT
          </p>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 md:flex-row">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} Salesient. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              className="text-xs text-white/30 transition-colors hover:text-white/60"
              href="/contact"
            >
              Support
            </Link>
            <span className="text-white/10">·</span>
            <Link
              className="text-xs text-white/30 transition-colors hover:text-white/60"
              href="/faq"
            >
              FAQ
            </Link>
          </div>
        </div>
      </footer>
    </section>
  );
}
