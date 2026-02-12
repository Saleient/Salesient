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
        className="flex min-h-screen flex-col items-center justify-center bg-background px-5 pt-12 sm:px-10 md:pt-24"
        id="quote"
      >
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-center gap-16 text-center md:gap-32">
          <div className="flex max-w-4xl flex-col items-center justify-center gap-5">
            <blockquote className="text-2xl leading-tight md:text-4xl">
              <span className="font-normal text-white/60">“We harness </span>
              <span className="font-bold text-white">your data</span>
              <span className="font-normal text-white/60">
                , understand your funnel & flow and{" "}
              </span>
              <span className="font-bold text-white">use AI</span>
              <span className="font-normal text-white/60">
                {" "}
                to help your sales rise above the noise. The best part?{" "}
              </span>
              <span className="font-bold text-white">We execute</span>
              <span className="font-normal text-white/60">, too.”</span>
            </blockquote>
            <div className="mt-10 h-px w-full bg-linear-to-r from-white/0 via-white/30 to-white/0" />
          </div>
          <Integration />
        </div>
      </section>{" "}
      {/* <Testimonial></Testimonial> */}
    </>
  );
}
