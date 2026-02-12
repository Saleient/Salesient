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
      question: "How is this different from other AI tools who chat with PDF?",
      answer:
        "Unlike basic PDF chat tools, SalesOrbit connects with your entire sales stack — CRMs, cloud storage, and communication tools — giving you a unified AI assistant that understands context across all your documents and data, not just single files.",
    },
    {
      question: "What all integrations I will have to chat with my documents?",
      answer:
        "We currently support 5 major integrations, allowing you to pull documents directly from your preferred cloud providers or storage platforms. More integrations are on our roadmap based on user needs.",
    },
    {
      question: "Who is this best suited for?",
      answer:
        "SalesOrbit is built for B2B sales teams — including consultants, sales operations, and revenue leaders in SaaS, consulting, and service-driven enterprises — who want to save time and make faster, data-backed decisions.",
    },
    {
      question: "What all types of sales documents SalesOrbit can handle?",
      answer:
        "From proposals, contracts, and pricing sheets to CRM exports, meeting notes, call transcripts, and sales playbooks — SalesOrbit supports both structured and unstructured sales documents, making it your single source of truth.",
    },
    {
      question: "Why would I share my sales data on your platform?",
      answer:
        "Your data security is our top priority. Our custom RAG system ensures documents are ingested, indexed, and retrieved securely, with enterprise-grade encryption (for enterprise plans only) and strict access controls preventing leakage or misuse of your information.",
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
            Have more questions? Contact us to get the answer you&apos;re
            looking for!
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
          <h2 className="mb-4 text-5xl md:text-7xl">Let&apos;s Talk!</h2>
          <p className="text-gray-400 text-lg">
            Have questions or need support? Fill out the form and we&apos;ll get back to you as soon as possible.
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
