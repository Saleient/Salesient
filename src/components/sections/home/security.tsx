import { InView } from "@/components/ui/in-view";

export default function Security() {
  return (
    <section className="flex justify-center bg-foreground px-5 py-12 sm:px-5 sm:py-16 md:px-10 md:py-24">
      <InView className="flex w-full max-w-[1440px] flex-col gap-6 rounded-2xl bg-background md:flex-row md:gap-12">
        <header className="flex flex-col justify-center gap-6 p-7 md:w-1/2 md:p-14">
          <h1 className="max-w-lg text-left font-medium text-3xl leading-tight md:text-4xl lg:text-5xl">
            Your Data, Secure with Enterprise Security
          </h1>
          <p className="max-w-lg text-white/70 sm:text-xl">
            Your data is secured by top GDPR standards and ISO standards.
          </p>
        </header>

        <section className="grid grid-cols-1 md:w-1/2">
          {[
            {
              imgSrc: "/gdpr.png",
              alt: "GDPR Compliance",
              description:
                "Strict internal audit processes for data management.",
            },
            {
              imgSrc: "/iso.png",
              alt: "ISO Standards",
              description: "Infrastructure that meets ISO standards.",
            },
          ].map(({ imgSrc, alt, description }, idx) => (
            <article
              className="items-left flex flex-col gap-5 border border-white/10 p-7 text-left md:p-14"
              key={idx}
            >
              <img alt={alt} className="h-16 w-fit" src={imgSrc} />
              <p>{description}</p>
            </article>
          ))}
        </section>
      </InView>
    </section>
  );
}
