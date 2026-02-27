import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselIndicator,
  CarouselItem,
} from "@/components/motion-primitives/carousel";

const testimonials = [
  {
    quote:
      "We used to spend hours consolidating documents across disparate tools. Now everything from pricing sheets to client proposals lives in a single workspace. The productivity gains have been measurable.",
    name: "Priya Kapoor",
    title: "Regional Sales Manager, Finverse",
  },
  {
    quote:
      "Our sales cycle has shortened significantly since adopting the platform. The streamlined proposal workflow alone has transformed how we operate.",
    name: "John Doe",
    title: "Head of Sales, TechCorp",
  },
  {
    quote:
      "The unified platform has fundamentally changed how we manage client relationships, contracts, and competitive positioning.",
    name: "Jane Smith",
    title: "Customer Success Lead, SoftSolutions",
  },
];

export default function Testimonial() {
  return (
    <>
      <Image
        alt="Quotes"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 h-full w-full select-none"
        fill
        src="/quotes.svg"
      />
      <Carousel className="relative z-10 w-full overflow-hidden">
        <CarouselContent>
          {testimonials.map(({ quote, name, title }) => (
            <CarouselItem key={`${name}-${title}`}>
              <figure className="relative mx-auto flex w-fit flex-col items-center justify-center gap-5 px-6 py-12">
                <blockquote className="relative z-10 max-w-lg font-light text-white text-xl leading-snug md:text-2xl">
                  {quote}
                </blockquote>
                <figcaption className="relative z-10 mt-6 flex flex-col items-center gap-1">
                  <span className="font-semibold text-white/80 uppercase tracking-wide">
                    {name}
                  </span>
                  <span className="text-sm text-white/60 uppercase">
                    {title}
                  </span>
                </figcaption>
              </figure>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselIndicator />
      </Carousel>
    </>
  );
}
