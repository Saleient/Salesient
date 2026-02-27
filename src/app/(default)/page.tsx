import Features from "@/components/sections/home/features";
import Hero from "@/components/sections/home/hero";
import Integration from "@/components/sections/home/integrations";
import Security from "@/components/sections/home/security";
export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Security />
      <section
        className="relative flex min-h-screen flex-col items-center justify-center bg-black px-5 pt-12 sm:px-10 md:pt-24"
        id="quote"
      >
        {/* Subtle radial glow */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02)_0%,transparent_60%)]" />

        <div className="z-10 mx-auto flex max-w-[1440px] flex-col items-center justify-center gap-16 text-center md:gap-32">
          <div className="flex max-w-4xl flex-col items-center justify-center gap-6">
            <div className="mb-4 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs tracking-widest text-white/40 uppercase">
              Our Mission
            </div>
            <blockquote className="text-2xl leading-snug md:text-4xl lg:text-5xl">
              <span className="font-light text-white/40">
                &ldquo;We transform{" "}
              </span>
              <span className="font-semibold text-white">your data</span>
              <span className="font-light text-white/40">
                {" "}
                into actionable intelligence, mapping your{" "}
              </span>
              <span className="font-semibold text-white">sales pipeline</span>
              <span className="font-light text-white/40"> and leveraging </span>
              <span className="font-semibold text-white">AI</span>
              <span className="font-light text-white/40">
                {" "}
                to drive measurable results. We don&apos;t just analyze &mdash;{" "}
              </span>
              <span className="font-semibold text-white">we execute</span>
              <span className="font-light text-white/40">.&rdquo;</span>
            </blockquote>
            <div className="mt-8 h-px w-full max-w-md bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
          <Integration />
        </div>
      </section>
    </>
  );
}
