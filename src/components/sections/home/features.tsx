"use client";
import Image from "next/image";
import { InView } from "@/components/ui/in-view";

// Types
type FeatureCardData = {
  id: string;
  title: string;
  description: string;
  bgGradient: string;
  textColor: string;
  imageSrc?: string;
};

type ProcessStepData = {
  id: number;
  title: string;
  description: string;
  imageSrc?: string;
  imageAlt: string;
  isReversed?: boolean;
};

// Data
const featureCards: FeatureCardData[] = [
  {
    id: "01",
    title: "Centralized Knowledge Base",
    description:
      "Unify product guides, FAQs, and playbooks in a single source of truth — accessible to your entire team, anywhere, anytime.",
    bgGradient: "from-[#028D35] to-[#2AA437]",
    textColor: "text-white",
    playbackId: "7heq00cjmwaKiq002aSGOLwSUAxab2jBQJ00uGd8TGFz3E",
  },
  {
    id: "02",
    title: "Distribute Sales-Ready Assets",
    description:
      "Deliver brand-approved decks, pricing sheets, and templates to every representative instantly — always current, always compliant.",
    bgGradient: "bg-white",
    textColor: "text-[#444444]",
    playbackId: "00302PQmTc7fTBr6lZFCOvMdgv57z64A02SOrQrNOYT87U",
  },
  {
    id: "03",
    title: "Competitive Intelligence",
    description:
      "Access structured insights on competitors, market trends, and win/loss analyses to refine your positioning and sharpen sales strategy.",
    bgGradient: "bg-white",
    textColor: "text-[#444444]",
    playbackId: "tQ1e02r02KUqfDbnGYK91DOQosxc1NnttTz5iyEW9yfZ00",
  },
  {
    id: "04",
    title: "Intelligent Meeting Preparation",
    description:
      "Generate tailored briefing documents with key insights, historical interactions, and personalized talking points before every client engagement.",
    bgGradient: "bg-white",
    textColor: "text-[#444444]",
    playbackId: "00302PQmTc7fTBr6lZFCOvMdgv57z64A02SOrQrNOYT87U",
  },
];

const processSteps: ProcessStepData[] = [
  {
    id: 1,
    title: "Configure Your Workspace",
    description:
      "Define your custom instructions, preferences, and business context so the platform adapts to your organization's unique workflows.",
    playbackId: "noGtcoHiq0100IE3kr9Fv01q00WZXR5gLaUK6E8OJB24s1Q",
    imageAlt: "Workspace configuration",
    isReversed: false,
  },
  {
    id: 2,
    title: "Connect Your Data Sources",
    description:
      "Select the data you want to share, connect your applications, upload documents and links — we handle the rest securely.",
    playbackId: "Oay3Ponbz1IIFy8Jb3h69ahO1STJKuNsxU5LDiKa01dI",
    imageAlt: "Data source connection",
    isReversed: true,
  },
  {
    id: 3,
    title: "Get Instant Insights",
    description:
      "Ask questions and receive real-time, citation-backed answers drawn from your connected data sources.",
    playbackId: "00302PQmTc7fTBr6lZFCOvMdgv57z64A02SOrQrNOYT87U",
    imageAlt: "Instant insights dashboard",
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
      <div className="w-fit rounded-full border border-white/10 bg-white/[0.03] px-5 py-2 text-sm text-white/40 backdrop-blur-sm">
        {" "}
        {badge}
      </div>
      <h2 className="text-left font-semibold text-3xl leading-tight tracking-tight sm:max-w-3xl sm:text-center md:font-medium lg:text-5xl">
        <span className="bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
          {title}
        </span>
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
      <div className="w-fit rounded-full border border-white/10 bg-white/[0.03] px-5 py-2 text-sm text-white/40 backdrop-blur-sm">
        {" "}
        {badge}
      </div>
      <h2 className="max-w-4xl text-left font-semibold text-3xl leading-tight tracking-tight sm:text-center md:font-medium lg:text-5xl">
        <span className="bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
          {title}
        </span>
      </h2>
      <p className="max-w-2xl text-left text-base text-white/50 leading-relaxed sm:text-center sm:text-lg">
        {description}
      </p>
    </div>
  );
}

type ProcessStepProps = {
  step: ProcessStepData;
};

function ProcessStep({ step }: ProcessStepProps) {
  const { id, title, description, imageSrc, imageAlt, isReversed } = step;

  const imageSection = (
    <div className="rounded-2xl md:min-h-96 lg:min-h-112 xl:min-h-128">
      {imageSrc ? (
        <Image
          alt={imageAlt}
          className="aspect-video h-full w-full rounded-2xl object-cover object-center"
          height={900}
          src={imageSrc}
          width={1600}
        />
      ) : (
        <div className="flex aspect-video items-center justify-center rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent">
          <div className="flex flex-col items-center gap-3 text-white/20">
            <svg
              className="h-12 w-12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Preview</title>
              <path
                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-sm">Preview coming soon</span>
          </div>
        </div>
      )}
    </div>
  );

  const contentSection = (
    <div className="flex flex-col justify-center px-6 py-8 md:px-10 md:py-12 lg:px-12 lg:py-16">
      <h3 className="mb-4 font-semibold text-white text-xl md:mb-6 md:text-3xl lg:text-4xl">
        {id}. {title}
      </h3>
      <p className="text-base text-white/50 leading-relaxed md:text-lg">
        {description}
      </p>
    </div>
  );

  return (
    <div
      className={
        "relative flex flex-col overflow-clip rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-6 md:grid md:grid-cols-2 md:gap-8 md:border-0 md:bg-transparent md:p-0 lg:gap-12"
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
  const { title, description, imageSrc } = card;

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-6 transition-all duration-300 hover:border-white/15 hover:bg-[#0d0d0d]">
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
          <div className="flex h-full w-full items-center justify-center rounded-xl border border-white/[0.04] bg-gradient-to-br from-white/[0.02] to-transparent">
            <div className="flex flex-col items-center gap-3 text-white/15">
              <svg
                className="h-10 w-10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Preview</title>
                <path
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-xs">Preview coming soon</span>
            </div>
          </div>
        )}
      </div>

      <h3 className="mb-4 font-semibold text-2xl text-white md:text-3xl">
        {title}
      </h3>

      <p className="text-base text-white/50 leading-relaxed">{description}</p>
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
          badge="How It Works"
          className="mb-12 md:mb-20"
          title="Surface insights from every corner of your organization"
        />
      </InView>

      <div className="grid w-full gap-12 text-white md:grid-cols-1 md:gap-16 lg:gap-20">
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
          badge="Capabilities"
          description="A comprehensive toolchain that elevates the entire sales document lifecycle — from content creation to polished delivery."
          title="Elevate Your Sales Document Workflow"
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
    <section className="flex min-h-screen flex-col items-center justify-center gap-20 bg-black px-5 py-20 sm:px-8 md:gap-40 md:px-12 md:py-32">
      {/* Process section */}
      <div className="w-full py-8">
        <ProcessSection steps={processSteps} />
      </div>

      {/* Divider */}
      <div className="w-full max-w-[1440px] border-white/10 border-t" />

      <WorkflowSection cards={featureCards} />
    </section>
  );
}
