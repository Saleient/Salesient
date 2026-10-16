"use client";

import {
  ArrowUpRight,
  HelpCircle,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
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
      "Salesient supports over 120+ enterprise integrations via OAuth 2.0, including Salesforce, Zoho CRM, Google Drive, Gmail, Slack, Notion, HubSpot, and Microsoft 365. You can connect your stack in under two minutes without custom engineering.",
  },
  {
    id: "03",
    category: "Use Cases",
    question: "Who is Salesient purpose-built for?",
    answer:
      "Salesient is engineered for B2B Account Executives, Solutions Engineers, Revenue Operations, and Deal Desk teams who handle complex proposals, security questionnaires, competitive battlecards, and custom MSAs.",
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
      "Every workspace operates within a tenant-isolated vector namespace encrypted with AES-256 at rest and TLS 1.3 in transit. We enforce a strict Zero-Data-Retention (ZDR) and Zero-Model-Training policy: your documents and prompts are never used to train foundation models.",
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

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Sticky Header Column */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="flex flex-col justify-between lg:col-span-5"
          >
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 font-mono text-[11px] uppercase tracking-wider text-zinc-400">
                <HelpCircle className="h-3.5 w-3.5 text-zinc-300" />
                <span>Knowledge &amp; Architecture FAQ</span>
              </div>

              <h1 className="font-semibold text-4xl tracking-[-0.03em] text-white sm:text-5xl">
                Frequently asked{" "}
                <span className="text-zinc-500">questions.</span>
              </h1>

              <p className="mt-4 text-sm text-zinc-400 leading-relaxed sm:text-base">
                Everything you need to know about our hybrid RAG pipeline,
                citation verification, security controls, and workspace setup.
              </p>

              {/* Support escalation card */}
              <div className="mt-10 rounded-2xl border border-white/[0.08] bg-[#09090c] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                    <MessageSquare className="h-4 w-4 text-zinc-200" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-sm text-white">
                      Need a custom security review?
                    </h2>
                    <p className="text-xs text-zinc-500">
                      Average response time &lt; 4 hours
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-zinc-400 leading-relaxed">
                  Our solutions engineering team can walk through custom CRM
                  schemas, SOC 2 documentation, or enterprise deployment.
                </p>
                <div className="mt-5">
                  <Link href="/contact">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 cursor-pointer rounded-full border-white/12 bg-white/[0.04] px-4 text-xs font-medium text-white hover:border-white/25 hover:bg-white/[0.08]"
                    >
                      <span>Contact Solutions Engineering</span>
                      <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Accordion Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-7"
          >
            <Accordion
              type="single"
              collapsible
              defaultValue="item-0"
              className="space-y-3.5"
            >
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={faq.id}
                  value={`item-${i}`}
                  className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#09090c] px-5 transition-colors data-[state=open]:border-white/20 data-[state=open]:bg-[#0c0c10] sm:px-6"
                >
                  <AccordionTrigger className="cursor-pointer py-5 text-left hover:no-underline">
                    <div className="flex items-start gap-3.5 pr-4">
                      <span className="mt-0.5 rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                        {faq.id}
                      </span>
                      <div>
                        <span className="block font-mono text-[10px] uppercase tracking-wider text-zinc-500">
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
