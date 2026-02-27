"use client";

import { useRouter } from "next/navigation";

export default function Pricing() {
  const plans = [
    {
      title: "Free",
      tagline: "For individuals & early adopters",
      price: "$0",
      period: "per month, billed monthly",
      features: [
        "Connect 1 integration (e.g., Google doc)",
        "Upload & search up to 100 documents in a month",
        "Basic AI assistant (email drafting, meeting notes, task summaries)",
        "Limited activity history (7 days)",
      ],
      highlight: false,
    },
    {
      title: "Team",
      tagline: "For growing teams up to 10 users",
      price: "$49/month",
      period: "per team, then +$15/user/month",
      features: [
        "Up to 5 integrations per team",
        "Full RAG search across team’s data sources",
        "Shared knowledge base (auto-synced across allowed integrated tool)",
        "Priority support",
      ],
      highlight: false,
    },
    {
      title: "Enterprise",
      tagline: "For large orgs & security-driven buyers",
      price: "Custom",
      period: "Upcoming for enterprise",
      features: [
        "Custom pricing and features",
        "Dedicated support",
        "Enterprise-grade security",
        "Scalable infrastructure",
        "24/7 priority support",
      ],
      highlight: true,
    },
  ];

  const router = useRouter();

  return (
    <>
      {" "}
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16 pt-32 text-foreground">
        {/* Header */}
        <div className="mb-16 max-w-4xl text-center">
          <h1 className="mb-4 text-4xl md:text-7xl">
            Transparent Pricing for Teams <br /> That Move Fast
          </h1>
          <p className="text-lg text-neutral-400">
            Select the plan that aligns with your team’s scale and workflow.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              className="w-full rounded-2xl bg-linear-to-b from-[#636363] to-[#2D2E2F] p-px md:max-w-[400px]"
              key={plan.title}
            >
              <div
                className={`flex h-full min-h-[440px] flex-col justify-between rounded-2xl p-10 ${
                  plan.highlight
                    ? "bg-[#115E59] text-white shadow-lg"
                    : "bg-[radial-gradient(70%_70%_at_50%_50%,#1a1b1c_0%,#151515_100%)]"
                }`}
              >
                <div>
                  <p
                    className={`mb-3 text-sm ${
                      plan.highlight ? "text-neutral-200" : "text-neutral-400"
                    }`}
                  >
                    {plan.tagline}
                  </p>
                  <h2 className="mb-2 font-bold text-4xl">{plan.price}</h2>
                  <p
                    className={`mb-6 text-sm ${
                      plan.highlight ? "text-neutral-200" : "text-neutral-400"
                    }`}
                  >
                    {plan.period}
                  </p>
                </div>
                <div>
                  <h3 className="mb-4 font-semibold text-lg">
                    What’s included:
                  </h3>
                  <ul
                    className={`space-y-4 text-sm ${
                      plan.highlight ? "text-neutral-100" : "text-neutral-300"
                    }`}
                  >
                    {plan.features.map((f) => (
                      <li key={f}>• {f}</li>
                    ))}
                  </ul>
                </div>
                <button
                  className={`mt-8 w-full rounded-full py-3 font-medium text-sm transition ${
                    plan.highlight
                      ? "bg-[radial-gradient(70%_70%_at_50%_50%,#1a1b1c_0%,#151515_100%)] hover:bg-neutral-900"
                      : "border border-neutral-700 hover:bg-neutral-800"
                  }`}
                  onClick={() => router.push("/login")}
                  type="button"
                >
                  {plan.price === "Custom" ? "Contact Sales" : "Request a Demo"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
