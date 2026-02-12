"use client";

import ContactForm from "@/components/contact-form";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background px-6 pt-40 pb-16 text-foreground md:px-6 md:py-24">
      <section className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-12 md:flex-row">
        <div className="md:w-[40%]">
          <h1 className="mb-6 text-5xl md:text-7xl">Get in Touch</h1>
          <p className="mb-4 text-gray-400 text-lg">
            Have questions about SalesOrbit? Want to request a new integration?
            Need support with your account?
          </p>
          <p className="text-gray-400 text-lg">
            Fill out the form and our team will get back to you within 24 hours.
          </p>
        </div>

        <div className="w-full flex-1">
          <div className="w-full rounded-2xl border border-white/10 bg-background/50 p-8">
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}
