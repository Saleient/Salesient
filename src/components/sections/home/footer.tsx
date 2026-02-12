import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <section className="z-10 w-full bg-background" id="footer">
      <footer className="mx-auto max-w-[1440px] px-6 py-16 text-gray-300">
        <div className="mx-auto max-w-[1440px]">
          {/* Header Section */}
          <div className="mb-12">
            <h2 className="font-semibold text-2xl text-foreground">
              SalesOrbit
            </h2>
          </div>

          <div className="md:hidden">
            <div className="grid grid-cols-2 gap-12">
              {/* Column 1 - Sitemap */}
              <div>
                <h3 className="mb-4 font-semibold text-base text-foreground">
                  Sitemap
                </h3>
                <ul className="space-y-3 text-foreground/70 text-sm">
                  <li>
                    <Link
                      className="transition-colors hover:text-foreground"
                      href="/"
                    >
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="transition-colors hover:text-foreground"
                      href="/pricing"
                    >
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="transition-colors hover:text-foreground"
                      href="/faq"
                    >
                      FAQ
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 2 - Additional Links */}
              <div>
                <h3 className="mb-4 font-semibold text-base text-foreground">
                  Resources
                </h3>
                <ul className="space-y-3 text-foreground/70 text-sm">
                  <li>
                    <Link
                      className="transition-colors hover:text-foreground"
                      href="/pricing#features"
                    >
                      Features
                    </Link>
                  </li>
                  <li>
                    <span
                      className="cursor-not-allowed opacity-50"
                      title="Coming soon"
                    >
                      Blog
                    </span>
                  </li>
                  <li>
                    <Link
                      className="transition-colors hover:text-foreground"
                      href="/contact"
                    >
                      Contact Support
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="hidden gap-16 md:grid md:grid-cols-3 lg:grid-cols-4">
            {/* Column 1 - About */}
            <div>
              <h3 className="mb-4 font-semibold text-foreground">About</h3>
              <p className="text-foreground/60 text-sm leading-relaxed">
                AI-powered sales intelligence platform that harnesses your data,
                understands your funnel, and helps your sales rise above the
                noise
              </p>
            </div>

            {/* Column 2 - Sitemap */}
            <div>
              <h3 className="mb-4 font-semibold text-foreground">Sitemap</h3>
              <ul className="space-y-3 text-foreground/70 text-sm">
                <li>
                  <Link
                    className="transition-colors hover:text-foreground"
                    href="/"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    className="transition-colors hover:text-foreground"
                    href="/pricing"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    className="transition-colors hover:text-foreground"
                    href="/faq"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3 - Resources */}
            <div>
              <h3 className="mb-4 font-semibold text-foreground">Resources</h3>
              <ul className="space-y-3 text-foreground/70 text-sm">
                <li>
                  <Link
                    className="transition-colors hover:text-foreground"
                    href="/pricing#features"
                  >
                    Features
                  </Link>
                </li>

                <li>
                  <Link
                    className="transition-colors hover:text-foreground"
                    href="/contact"
                  >
                    Contact Support
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4 - Legal */}
            <div className="hidden lg:block">
              <h3 className="mb-4 font-semibold text-foreground">Legal</h3>
              <ul className="space-y-3 text-foreground/70 text-sm">
                <li>
                  <span
                    className="cursor-not-allowed opacity-50"
                    title="Coming soon"
                  >
                    Privacy Policy
                  </span>
                </li>
                <li>
                  <span
                    className="cursor-not-allowed opacity-50"
                    title="Coming soon"
                  >
                    Terms of Service
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Image */}
        <Image
          alt="SalesOrbit"
          className="h-full w-full pt-16 md:pt-32"
          height={60}
          src="/salesorbit.svg"
          width={200}
        />
      </footer>
    </section>
  );
}
