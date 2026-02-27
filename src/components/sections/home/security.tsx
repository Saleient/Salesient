import { InView } from "@/components/ui/in-view";

export default function Security() {
  return (
    <section className="flex justify-center bg-black px-5 py-12 sm:px-5 sm:py-16 md:px-10 md:py-24">
      <InView className="flex w-full max-w-[1440px] flex-col gap-6 overflow-hidden rounded-2xl border border-white/[0.06] bg-[#050505] md:flex-row md:gap-12">
        <header className="flex flex-col justify-center gap-6 p-7 md:w-1/2 md:p-14">
          <div className="w-fit rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs tracking-widest text-white/40 uppercase">
            Security
          </div>
          <h1 className="max-w-lg text-left font-medium text-3xl leading-tight md:text-4xl lg:text-5xl">
            <span className="bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
              Enterprise-Grade Data Security
            </span>
          </h1>
          <p className="max-w-lg text-white/40 sm:text-xl">
            Industry-leading compliance with GDPR and ISO standards to safeguard
            your most sensitive data.
          </p>
        </header>

        <section className="grid grid-cols-1 md:w-1/2">
          {[
            {
              imgSrc: "/gdpr.png",
              alt: "GDPR Compliance",
              description:
                "Rigorous internal audit processes ensuring compliant data governance.",
            },
            {
              imgSrc: "/iso.png",
              alt: "ISO Standards",
              description:
                "Certified infrastructure meeting international ISO standards.",
            },
          ].map(({ imgSrc, alt, description }, idx) => (
            <article
              className="items-left flex flex-col gap-5 border border-white/[0.06] p-7 text-left transition-colors hover:bg-white/[0.02] md:p-14"
              key={idx}
            >
              <img alt={alt} className="h-16 w-fit" src={imgSrc} />
              <p className="text-white/50">{description}</p>
            </article>
          ))}
        </section>
      </InView>
    </section>
  );
}
