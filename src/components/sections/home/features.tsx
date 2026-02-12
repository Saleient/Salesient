"use client";
import MuxPlayer from "@mux/mux-player-react";
import Image from "next/image";
import { InView } from "@/components/ui/in-view";
import "@mux/mux-player/themes/minimal";

// Types
type FeatureCardData = {
  id: string;
  title: string;
  description: string;
  bgGradient: string;
  textColor: string;
  playbackId: string;
  imageSrc?: string;
};

type ProcessStepData = {
  id: number;
  title: string;
  description: string;
  imageSrc?: string;
  imageAlt: string;
  isReversed?: boolean;
  playbackId?: string;
};

// Data
const featureCards: FeatureCardData[] = [
  {
    id: "01",
    title: "Centralized Knowledge Base",
    description:
      "No more remembering where that one doc is—unify all product guides, FAQs, and playbooks in one place, accessible anywhere, anytime by your team.",
    bgGradient: "from-[#028D35] to-[#2AA437]",
    textColor: "text-white",
    playbackId: "7heq00cjmwaKiq002aSGOLwSUAxab2jBQJ00uGd8TGFz3E",
  },
  {
    id: "02",
    title: "Distribute Ready Assets",
    description:
      "Deliver brand-approved decks, pricing sheets, and templates instantly to every rep, always up to date.",
    bgGradient: "bg-white",
    textColor: "text-[#444444]",
    playbackId: "00302PQmTc7fTBr6lZFCOvMdgv57z64A02SOrQrNOYT87U",
  },
  {
    id: "03",
    title: "Do better competitive analysis",
    description:
      "Why waste time hunting for competitive intel? Access organized insights on competitors, market trends, and win/loss analyses to sharpen your sales strategies.",
    bgGradient: "bg-white",
    textColor: "text-[#444444]",
    playbackId: "tQ1e02r02KUqfDbnGYK91DOQosxc1NnttTz5iyEW9yfZ00",
  },
  {
    id: "04",
    title: "Be better prepared for meetings",
    description:
      "Have a client call coming up? Instantly pull up tailored briefs with key insights, past interactions, and personalized talking points to ace every conversation.",
    bgGradient: "bg-white",
    textColor: "text-[#444444]",
    playbackId: "00302PQmTc7fTBr6lZFCOvMdgv57z64A02SOrQrNOYT87U",
  },
];

const processSteps: ProcessStepData[] = [
  {
    id: 1,
    title: "Let Us understand you",
    description:
      "Set your custom instructions, preferences, and business context to tailor our model to your unique needs.",
    playbackId: "noGtcoHiq0100IE3kr9Fv01q00WZXR5gLaUK6E8OJB24s1Q",
    imageAlt: "Feature 1",
    isReversed: false,
  },
  {
    id: 2,
    title: "Allow us to snoop through your data (securely of course!)",
    description:
      "You choose what data to share, what apps to connect, some PDFs and links and we take care of the rest!",
    playbackId: "Oay3Ponbz1IIFy8Jb3h69ahO1STJKuNsxU5LDiKa01dI",
    imageAlt: "Feature 2",
    isReversed: true,
  },
  {
    id: 3,
    title: "Get Instant Insights",
    description:
      "Ask questions and you will get up to date answers with your data, with citations, from the source you choose from!",
    playbackId: "00302PQmTc7fTBr6lZFCOvMdgv57z64A02SOrQrNOYT87U",
    imageAlt: "Feature 2",
    isReversed: false,
  },
];

// Components
type SectionHeaderProps = {
  badge: string;
  title: string;
  className?: string;
};

function SectionHeader({ badge, title, className = "" }: SectionHeaderProps) {
  return (
    <div
      className={`flex w-full flex-col items-start justify-center gap-6 md:items-center ${className}`}
    >
      <div className="w-fit rounded-full border border-white/30 bg-white/20 px-4 py-2 text-neutral-800 shadow-lg backdrop-blur-md">
        {" "}
        {badge}
      </div>
      <h2 className="text-left font-semibold text-3xl text-neutral-950 leading-tight tracking-tight sm:max-w-3xl sm:text-center md:font-medium lg:text-5xl">
        {title}
      </h2>
    </div>
  );
}

type WorkflowHeaderProps = {
  badge: string;
  title: string;
  description: string;
};

function WorkflowHeader({ badge, title, description }: WorkflowHeaderProps) {
  return (
    <div className="flex w-full flex-col items-start justify-center gap-6 pb-8 md:items-center md:pb-16">
      <div className="w-fit rounded-full border border-white/30 bg-white/20 px-4 py-2 text-neutral-800 shadow-lg backdrop-blur-md">
        {" "}
        {badge}
      </div>
      <h2 className="max-w-4xl text-left font-semibold text-3xl text-neutral-950 leading-tight tracking-tight sm:text-center md:font-medium lg:text-5xl">
        {title}
      </h2>
      <p className="max-w-2xl text-left text-base text-neutral-700 leading-relaxed sm:text-center sm:text-lg">
        {description}
      </p>
    </div>
  );
}

type ProcessStepProps = {
  step: ProcessStepData;
};

function ProcessStep({ step }: ProcessStepProps) {
  const { id, title, description, imageSrc, imageAlt, isReversed, playbackId } =
    step;

  const imageSection = (
    <div className="rounded-2xl md:min-h-96 lg:min-h-112 xl:min-h-128">
      {playbackId ? (
        <MuxPlayer
          autoPlay={false}
          className="aspect-video min-h-full min-w-full rounded-2xl"
          loop={true}
          muted={true}
          playbackId={playbackId}
          theme="minimal"
        />
      ) : (
        <Image
          alt={imageAlt}
          className="aspect-video h-full w-full rounded-2xl object-cover object-center"
          height={900}
          src={imageSrc || ""}
          width={1600}
        />
      )}
    </div>
  );

  const contentSection = (
    <div className="flex flex-col justify-center px-6 py-8 md:px-10 md:py-12 lg:px-12 lg:py-16">
      <h3 className="mb-4 font-semibold text-neutral-900 text-xl md:mb-6 md:text-3xl lg:text-4xl">
        {id}. {title}
      </h3>
      <p className="text-base text-neutral-700 leading-relaxed md:text-lg">
        {description}
      </p>
    </div>
  );

  return (
    <div
      className={
        "relative flex flex-col overflow-clip rounded-xl bg-linear-to-br from-neutral-100 to-neutral-200 p-6 md:grid md:grid-cols-2 md:gap-8 md:bg-transparent md:p-0 lg:gap-12"
      }
    >
      <div className="md:hidden">
        {imageSection}
        {contentSection}
      </div>
      <div className="hidden md:contents">
        {isReversed ? (
          <>
            {contentSection}
            {imageSection}
          </>
        ) : (
          <>
            {imageSection}
            {contentSection}
          </>
        )}
      </div>
    </div>
  );
}

type FeatureCardProps = {
  card: FeatureCardData;
};

function FeatureCard({ card }: FeatureCardProps) {
  const { title, description, playbackId, imageSrc } = card;

  return (
    <div className="relative flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-6 transition-shadow duration-300 hover:shadow-lg">
      <div className="mb-6 aspect-video max-h-128">
        {imageSrc ? (
          <Image
            alt={title}
            className="h-full w-full rounded-xl object-cover"
            height={900}
            src={imageSrc}
            width={1600}
          />
        ) : (
          <MuxPlayer
            autoPlay={false}
            className="aspect-video min-h-full min-w-full rounded-xl"
            loop={true}
            muted={true}
            playbackId={playbackId}
            theme="minimal"
          />
        )}
      </div>

      <h3 className="mb-4 font-semibold text-2xl text-neutral-900 md:text-3xl">
        {title}
      </h3>

      <p className="text-base text-neutral-700 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

type ProcessSectionProps = {
  steps: ProcessStepData[];
};

function ProcessSection({ steps }: ProcessSectionProps) {
  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center justify-center">
      <InView transition={{ duration: 0.5, delay: 0 }}>
        <SectionHeader
          badge="How it Works 🤔"
          className="mb-12 md:mb-20"
          title="We will help you find insights wherever they are hidden"
        />
      </InView>

      <div className="grid w-full gap-12 text-neutral-950 md:grid-cols-1 md:gap-16 lg:gap-20">
        {steps.map((step, idx) => (
          <InView
            key={step.id}
            transition={{ duration: 0.6, delay: idx * 0.2 }}
          >
            <ProcessStep step={step} />
          </InView>
        ))}
      </div>
    </div>
  );
}

type WorkflowSectionProps = {
  cards: FeatureCardData[];
};

function WorkflowSection({ cards }: WorkflowSectionProps) {
  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center justify-center">
      <InView transition={{ duration: 0.5, delay: 0 }}>
        <WorkflowHeader
          badge="Features ✨"
          description="Build with a toolchain that elevates the entire sales document lifecycle from team-first design to polished artifact delivery."
          title="Elevate Sales Document Workflow"
        />
      </InView>

      <div className="grid w-full grid-cols-1 gap-8 sm:grid-cols-2 md:gap-12 lg:gap-16">
        {cards.map((card, idx) => (
          <InView
            key={card.id}
            transition={{ duration: 0.6, delay: idx * 0.15 }}
          >
            <FeatureCard card={card} />
          </InView>
        ))}
      </div>
    </div>
  );
}

// Main Component
export default function Features() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center gap-20 bg-foreground px-5 py-20 sm:px-8 md:gap-40 md:px-12 md:py-32">
      {/* Process section with subtle background */}
      <div className="w-full rounded-3xl bg-linear-to-b from-transparent via-neutral-50/30 to-transparent py-8">
        <ProcessSection steps={processSteps} />
      </div>

      {/* Divider */}
      <div className="w-full max-w-[1440px] border-neutral-300 border-t" />

      <WorkflowSection cards={featureCards} />
    </section>
  );
}
