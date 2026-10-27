"use client";

import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    id: "01",
    category: "Architecture",
    question:
      "How does Salesient differ from standard PDF chat or AI wrappers?",
    answer:
      "Standard chatbots chunk documents blindly and hallucinate when asked about complex pricing tables or multi-document dependencies. Salesient connects directly to your CRM, cloud storage, and communication stack, preserving tabular schemas and legal clause hierarchies—and enforces deterministic citations so every generated statement links back to the exact source page.",
  },
  {
    id: "02",
    category: "Integrations",
    question: "Which CRM and cloud integrations are supported?",
    answer:
      "Salesient supports over 120+ enterprise integrations, including Salesforce, Zoho CRM, Google Drive, Gmail, Slack, Notion, HubSpot, and Microsoft 365. You can connect your stack in minutes without custom engineering.",
  },
  {
    id: "03",
    category: "Use Cases",
    question: "Who is Salesient purpose-built for?",
    answer:
      "Salesient is built for B2B Account Executives, Solutions Engineers, Revenue Operations, and Deal Desk teams who handle complex proposals, security questionnaires, competitive battlecards, and custom MSAs.",
  },
  {
    id: "04",
    category: "Ingestion",
    question: "What file formats and sales collateral can we index?",
    answer:
      "You can upload and index PDFs, Word documents (.docx), Excel spreadsheets (.xlsx), CSV rate cards, PowerPoint decks (.pptx), Markdown, and plain text—alongside live records synced from your connected CRM and workspace apps.",
  },
  {
    id: "05",
    category: "Security",
    question: "How is our sensitive deal and customer data protected?",
    answer:
      "Every workspace is isolated per organization and encrypted at rest and in transit. Your documents, CRM records, and queries are never used to train foundation models.",
  },
  {
    id: "06",
    category: "Pro Plan & Onboarding",
    question: "How do we purchase and activate the Pro Plan?",
    answer:
      "Clicking 'Buy Pro Plan' on our Pricing page routes you directly to our Solutions & Billing desk (/contact?plan=pro) with the Pro Plan pre-selected. Our team provisions your shared team vault, assists with initial CRM connector mapping, and dispatches a payment link or corporate invoice within 2 business hours.",
  },
  {
    id: "07",
    category: "Refund & Cancellation Policy",
    question: "What is your refund and cancellation policy for paid plans?",
    answer:
      "Every new Pro subscription (monthly or annual) is backed by a 14-day 100% money-back guarantee. If Salesient does not meet your team's expectations within the first 14 calendar days, request a full refund via billing@salesient.com or our Contact page—no questions asked. Beyond 14 days, you can cancel anytime with zero cancellation fees, and annual plans receive prorated refunds for unused full months.",
  },
];

export default function FAQPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050507] px-4 pt-32 pb-20 text-white sm:px-6 md:pt-40 md:pb-28 lg:px-8">
      {/* Subtle Grid & Top Spotlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grid-subtle [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000_25%,transparent_100%)]"
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Sticky Header Column */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col justify-between lg:col-span-5"
            initial={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.45 }}
          >
            <div>
              <h1 className="font-semibold text-4xl text-white tracking-[-0.03em] sm:text-5xl">
                Frequently asked{" "}
                <span className="text-zinc-500">questions.</span>
              </h1>

              <p className="mt-4 text-sm text-zinc-400 leading-relaxed sm:text-base">
                Everything you need to know about our workspace, citation
                verification, security controls, Pro plan onboarding, and our
                14-day refund policy.
              </p>

              {/* Support escalation card */}
              <div className="mt-8 rounded-2xl border border-white/[0.08] bg-[#09090c] p-6">
                <h2 className="font-semibold text-sm text-white">
                  Ready to activate Pro or need a security review?
                </h2>
                <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                  Our team can provision your Pro workspace, walk through custom
                  CRM schemas, or share security documentation.
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-2.5">
                  <Link href="/contact?plan=pro">
                    <Button
                      className="h-9 cursor-pointer rounded-full bg-white px-4 font-semibold text-black text-xs hover:bg-zinc-200"
                      size="sm"
                    >
                      <span>Buy Pro Plan</span>
                      <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  <Link href="/pricing#refund-policy">
                    <Button
                      className="h-9 cursor-pointer rounded-full border-white/12 bg-white/[0.04] px-4 font-medium text-white text-xs hover:border-white/25 hover:bg-white/[0.08]"
                      size="sm"
                      variant="outline"
                    >
                      <span>14-Day Refund Policy</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Accordion Column */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Accordion
              className="space-y-3.5"
              collapsible
              defaultValue="item-0"
              type="single"
            >
              {faqs.map((faq, i) => (
                <AccordionItem
                  className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#09090c] px-5 transition-colors data-[state=open]:border-white/20 data-[state=open]:bg-[#0c0c10] sm:px-6"
                  key={faq.id}
                  value={`item-${i}`}
                >
                  <AccordionTrigger className="cursor-pointer py-5 text-left hover:no-underline">
                    <div className="flex items-start gap-3.5 pr-4">
                      <span className="mt-0.5 rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                        {faq.id}
                      </span>
                      <div>
                        <span className="block font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
                          {faq.category}
                        </span>
                        <span className="mt-1 block font-medium text-sm text-white sm:text-base">
                          {faq.question}
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 pl-10 text-xs text-zinc-400 leading-relaxed sm:text-sm">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
