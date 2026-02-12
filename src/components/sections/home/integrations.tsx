import Link from "next/link";
import {
  Marquee,
  MarqueeContent,
  MarqueeFade,
  MarqueeItem,
} from "@/components/kibo-ui/marquee";
import { InView } from "@/components/ui/in-view";

const integrationImages = [
  { src: "/integrations/gmail.png", alt: "Gmail" },
  { src: "/integrations/salesforce.png", alt: "Salesforce" },
  { src: "/integrations/slack.png", alt: "Slack" },
  { src: "/integrations/zoho.png", alt: "Zoho" },
];

export default function Integration() {
  return (
    <div className="flex w-full justify-center py-12 sm:py-16 md:py-12 md:pb-24">
      <div className="flex w-full flex-col gap-10 md:gap-12">
        <InView className="mx-auto w-fit!">
          <h1 className="max-w-xl text-left font-medium text-4xl leading-tight md:text-center md:text-5xl lg:text-6xl">
            Integrate It With The Tools You Love
          </h1>{" "}
        </InView>

        <div className="flex h-full w-full flex-col items-center justify-center gap-6 sm:gap-8">
          {/* Marquee for desktop */}
          <div className="hidden md:block">
            <Marquee className="h-full w-full [--duration:20s]">
              <MarqueeFade side="left" />
              <MarqueeFade side="right" />
              <MarqueeContent pauseOnHover>
                {integrationImages.map((image) => (
                  <MarqueeItem
                    className="flex items-center justify-center"
                    key={image.src}
                  >
                    {/** biome-ignore lint/performance/noImgElement: <explanation> */}
                    {/** biome-ignore lint/correctness/useImageSize: <explanation> */}
                    <img
                      alt={image.alt}
                      className="mx-8 object-contain"
                      src={image.src}
                    />
                  </MarqueeItem>
                ))}
              </MarqueeContent>
            </Marquee>
          </div>

          {/* Vertical list for mobile */}
          <div className="block flex flex-col items-center gap-4 md:hidden">
            {integrationImages.map((image) => (
              <div className="flex items-center justify-center" key={image.src}>
                {/** biome-ignore lint/performance/noImgElement: <explanation> */}
                {/** biome-ignore lint/correctness/useImageSize: <explanation> */}
                <img
                  alt={image.alt}
                  className="object-contain"
                  src={image.src}
                />
              </div>
            ))}
          </div>

          {/* 20+ Integrations Section */}
          <InView>
            <div className="flex h-full w-full flex-col items-center justify-around gap-12 rounded-lg bg-zinc-100 p-6 text-left text-black sm:p-10 md:flex-row md:gap-24 md:p-15">
              {/** biome-ignore lint/performance/noImgElement: <explanation> */}
              {/** biome-ignore lint/correctness/useImageSize: <explanation> */}
              <img
                alt={"Custom"}
                className="w-full max-w-xs object-contain md:max-w-md lg:max-w-lg"
                src={"/integrations.png"}
              />
              <div className="mb-6 flex w-full max-w-xl flex-col items-start gap-4">
                <h3 className="font-medium text-2xl md:text-4xl lg:text-6xl">
                  We have over{" "}
                  <span className="text-sky-600">120+ Integrations</span>
                </h3>
                <p className="text-base leading-relaxed sm:text-lg">
                  From CRMs and cloud storage to calendars, communication
                  platforms, and analytics tools—our ecosystem keeps expanding.
                  And if there’s a platform you need that’s not on the list,
                  just let us know—we’ll make it happen.
                </p>
              </div>
              <Link href="/integration">
                <button
                  className="rounded-full bg-sky-600 px-6 py-3 text-white transition-colors hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                  type="button"
                >
                  Explore Integrations
                </button>
              </Link>
            </div>
          </InView>
        </div>
      </div>
    </div>
  );
}
