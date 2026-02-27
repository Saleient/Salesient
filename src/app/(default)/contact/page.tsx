"use client";

import ContactForm from "@/components/contact-form";

const contactInfo = [
  {
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Email</title>
        <path
          d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    label: "Email us",
    value: "support@salesient.com",
  },
  {
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Response Time</title>
        <path
          d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    label: "Response time",
    value: "Within 24 hours",
  },
  {
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Location</title>
        <path
          d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    label: "Location",
    value: "Remote-first, Global",
  },
];

export default function ContactPage() {
  return (
    <div className="relative min-h-screen bg-black px-6 pt-32 pb-16 text-white md:px-6 md:pt-40 md:pb-24">
      {/* Background glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)]" />

      {/* Header */}
      <div className="relative z-10 mx-auto mb-16 max-w-[1440px] text-center md:mb-20">
        <div className="mx-auto mb-6 w-fit rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs tracking-widest text-white/40 uppercase">
          Contact
        </div>
        <h1 className="mx-auto mb-5 max-w-2xl text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
          <span className="bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
            Let&apos;s Start a Conversation
          </span>
        </h1>
        <p className="mx-auto max-w-lg text-base text-white/40 md:text-lg">
          Have questions about Salesient? Need help with integrations?
          We&apos;re here to help your team succeed.
        </p>
      </div>

      <section className="relative z-10 mx-auto flex max-w-[1440px] flex-col gap-12 lg:flex-row lg:gap-16">
        {/* Left side — Info */}
        <div className="flex flex-col gap-8 lg:w-[38%] lg:pt-4">
          <div className="flex flex-col gap-4">
            {contactInfo.map((item) => (
              <div
                className="flex items-start gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-colors hover:border-white/10 hover:bg-white/[0.03]"
                key={item.label}
              >
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-white/50">
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs tracking-wider text-white/40 uppercase">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm text-white/70">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Trust badge */}
          <div className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent p-6">
            <div className="mb-3 flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-xs tracking-wider text-white/40 uppercase">
                Enterprise Ready
              </span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed">
              SOC 2 compliant infrastructure with end-to-end encryption. Your
              data is always secure with Salesient.
            </p>
          </div>
        </div>

        {/* Right side — Form */}
        <div className="flex-1">
          <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-transparent p-8 backdrop-blur-sm md:p-10">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white">
                Send us a message
              </h2>
              <p className="mt-1 text-sm text-white/30">
                Fill in the details below and we&apos;ll get back to you
                shortly.
              </p>
            </div>
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}
