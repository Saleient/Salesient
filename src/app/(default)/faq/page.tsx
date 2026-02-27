"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ContactForm from "@/components/contact-form";

export default function FAQPage() {
  const faqs = [
    {
      question: "How does Salesient differ from standard document AI tools?",
      answer:
        "Unlike basic PDF chat tools, Salesient connects with your entire sales stack — CRMs, cloud storage, and communication tools — providing a unified AI assistant that understands context across all your documents and data, not just individual files.",
    },
    {
      question: "Which integrations are supported for document access?",
      answer:
        "We currently support 5 major integrations, enabling you to import documents directly from your preferred cloud providers and storage platforms. Additional integrations are on our roadmap based on customer feedback.",
    },
    {
      question: "Who is Salesient designed for?",
      answer:
        "Salesient is purpose-built for B2B sales teams — including consultants, sales operations professionals, and revenue leaders in SaaS, consulting, and service-driven enterprises — who need to operate faster with data-backed decisions.",
    },
    {
      question: "What types of sales documents does Salesient support?",
      answer:
        "From proposals, contracts, and pricing sheets to CRM exports, meeting notes, call transcripts, and sales playbooks — Salesient handles both structured and unstructured sales documents, serving as your single source of truth.",
    },
    {
      question: "How is my sales data protected on the platform?",
      answer:
        "Data security is foundational to our platform. Our custom RAG system ensures documents are ingested, indexed, and retrieved securely, with enterprise-grade encryption (available on Enterprise plans) and strict access controls to prevent unauthorized access.",
    },
  ];

  return (
    <div className="min-h-screen bg-background px-6 pt-40 pb-16 text-foreground md:px-6 md:py-24">
      {/* FAQ Section */}
      <section className="mx-auto mb-24 flex min-h-[50vh] max-w-[1440px] flex-col items-center justify-between gap-12 md:flex-row">
        <div className="flex flex-col justify-center md:w-[50%]">
          <h2 className="mb-4 text-5xl md:text-7xl">
            Frequently Asked Questions
          </h2>
          <p className="max-w-md text-gray-400 text-lg md:text-xl">
            Have additional questions? Reach out and our team will be happy to
            help.
          </p>
        </div>
        <div className="w-full flex-1">
          <Accordion
            className="w-full flex-1 space-y-4"
            collapsible
            type="single"
          >
            {faqs.map((faq, i) => (
              <div
                className="w-full rounded-xl! bg-linear-to-b from-[#636363bd] to-[#2d2e2fb7] p-px"
                key={faq.question}
              >
                <AccordionItem
                  className="rounded-xl! border border-white/10 bg-background px-3 md:px-4"
                  value={`item-${i}`}
                >
                  <AccordionTrigger className="text-left font-medium text-base text-foreground md:text-lg">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-gray-400">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </div>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Contact Section */}
      <section
        className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-12 md:flex-row"
        id="contact"
      >
        <div className="md:w-[40%]">
          <h2 className="mb-4 text-5xl md:text-7xl">Contact Us</h2>
          <p className="text-gray-400 text-lg">
            Have questions or need support? Fill out the form and we&apos;ll
            respond as soon as possible.
          </p>
        </div>

        {/* Contact Form */}
        <div className="w-full flex-1">
          <div className="w-full rounded-2xl border border-white/10 bg-background/50 p-8">
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}
