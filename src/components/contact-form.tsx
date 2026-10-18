"use client";

import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Loader2,
  RefreshCcw,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type InquiryTopic = "pro" | "enterprise" | "security" | "billing";

const topicOptions: {
  id: InquiryTopic;
  label: string;
  badge: string;
  defaultMessage: string;
}[] = [
  {
    id: "pro",
    label: "Buy Pro Plan ($19/mo)",
    badge: "Instant Onboarding",
    defaultMessage:
      "We would like to purchase and activate the Salesient Pro Plan for our revenue team. Please share the checkout link / invoice and onboarding steps for connecting our CRM.",
  },
  {
    id: "enterprise",
    label: "Enterprise Custom",
    badge: "Custom SLA",
    defaultMessage:
      "We are evaluating Salesient Enterprise for our organization and would like to discuss volume seat licensing, dedicated vector isolation, and SAML SSO.",
  },
  {
    id: "security",
    label: "SOC 2 & Security Review",
    badge: "DPA & Infosec",
    defaultMessage:
      "Please share your SOC 2 Type II report, GDPR Art. 28 Data Processing Addendum, and architecture security brief for our procurement review.",
  },
  {
    id: "billing",
    label: "Billing & Refund Desk",
    badge: "14-Day Guarantee",
    defaultMessage:
      "I need assistance with a workspace invoice, seat adjustment, or 14-day refund guarantee request for our account.",
  },
];

function resolveTopicFromParam(planParam?: string): InquiryTopic {
  if (planParam === "enterprise") {
    return "enterprise";
  }
  if (planParam === "security") {
    return "security";
  }
  if (planParam === "billing" || planParam === "refund") {
    return "billing";
  }
  return "pro";
}

function getBillingCycleNote(
  topic: InquiryTopic,
  billingParam?: string
): string {
  if (topic !== "pro") {
    return "";
  }
  if (billingParam === "annual") {
    return " (Annual Billing · $15/mo billed at $180/yr)";
  }
  return " (Monthly Billing · $19/mo)";
}

export default function ContactForm() {
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan")?.toLowerCase();
  const billingParam = searchParams.get("billing")?.toLowerCase();

  const [selectedTopic, setSelectedTopic] = useState<InquiryTopic>("pro");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    seats: "5–10 seats",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  useEffect(() => {
    const matchedTopic = resolveTopicFromParam(planParam);
    setSelectedTopic(matchedTopic);

    const topicConfig = topicOptions.find((t) => t.id === matchedTopic);
    if (planParam && topicConfig) {
      const cycleNote = getBillingCycleNote(matchedTopic, billingParam);
      setFormData((prev) => ({
        ...prev,
        message: prev.message || `${topicConfig.defaultMessage}${cycleNote}`,
      }));
    }
  }, [planParam, billingParam]);

  const handleTopicSelect = (topicId: InquiryTopic) => {
    setSelectedTopic(topicId);
    const topicConfig = topicOptions.find((t) => t.id === topicId);
    const isDefaultOrEmpty =
      !formData.message.trim() ||
      topicOptions.some((t) => formData.message.startsWith(t.defaultMessage));

    if (topicConfig && isDefaultOrEmpty) {
      setFormData((prev) => ({
        ...prev,
        message: topicConfig.defaultMessage,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    const activeTopic = topicOptions.find((t) => t.id === selectedTopic);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          topic: activeTopic?.label || selectedTopic,
          billingCycle: billingParam || "monthly",
        }),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({
          name: "",
          email: "",
          company: "",
          seats: "5–10 seats",
          message: "",
        });
      } else {
        setSubmitStatus("error");
      }
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="w-full space-y-5" onSubmit={handleSubmit}>
      {/* Dynamic Pro Plan Checkout / Onboarding Banner when redirected from Pricing */}
      {selectedTopic === "pro" && (
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/[0.09] via-emerald-500/[0.04] to-transparent p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 font-mono font-semibold text-emerald-400 text-xs uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              <span>
                Pro Plan Provisioning &middot;{" "}
                {billingParam === "annual"
                  ? "$15/mo (Billed Annually)"
                  : "$19/mo Base"}
              </span>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] text-emerald-300">
              <RefreshCcw className="h-2.5 w-2.5" />
              14-Day Full Refund Guarantee
            </span>
          </div>
          <p className="mt-2 text-xs text-zinc-300 leading-relaxed">
            Complete the form below to activate your Pro workspace. Our
            onboarding desk will provision your isolated tenant vector index and
            dispatch your payment link or corporate invoice within 2 business
            hours.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-zinc-400">
            <span className="inline-flex items-center gap-1">
              <Check className="h-3 w-3 text-emerald-400" />
              Up to 5 live CRM &amp; Cloud connectors
            </span>
            <span className="inline-flex items-center gap-1">
              <Check className="h-3 w-3 text-emerald-400" />
              5,000 indexed docs / month
            </span>
            <Link
              className="text-emerald-400 underline underline-offset-4 hover:text-emerald-300"
              href="/pricing#refund-policy"
            >
              View Refund Policy
            </Link>
          </div>
        </div>
      )}

      {/* Inquiry Topic Selector */}
      <div className="space-y-2">
        <Label className="font-mono text-[11px] text-zinc-400 uppercase tracking-wider">
          Inquiry Type *
        </Label>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {topicOptions.map((option) => {
            const isSelected = selectedTopic === option.id;
            return (
              <button
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-xl border px-3.5 py-2.5 text-left transition-all",
                  isSelected
                    ? "border-white/30 bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
                    : "border-white/[0.08] bg-[#060608] text-zinc-400 hover:border-white/15 hover:text-zinc-200"
                )}
                key={option.id}
                onClick={() => handleTopicSelect(option.id)}
                type="button"
              >
                <span className="font-medium text-xs">{option.label}</span>
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 font-mono text-[9px] uppercase",
                    isSelected
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-white/[0.04] text-zinc-500"
                  )}
                >
                  {option.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label
            className="font-mono text-[11px] text-zinc-400 uppercase tracking-wider"
            htmlFor="name"
          >
            Full Name *
          </Label>
          <Input
            className="h-11 rounded-xl border-white/10 bg-[#060608] text-white placeholder:text-zinc-600 focus:border-white/25"
            id="name"
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Alex Morgan"
            required
            type="text"
            value={formData.name}
          />
        </div>

        <div className="space-y-2">
          <Label
            className="font-mono text-[11px] text-zinc-400 uppercase tracking-wider"
            htmlFor="email"
          >
            Work Email *
          </Label>
          <Input
            className="h-11 rounded-xl border-white/10 bg-[#060608] text-white placeholder:text-zinc-600 focus:border-white/25"
            id="email"
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="alex@company.com"
            required
            type="email"
            value={formData.email}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label
            className="font-mono text-[11px] text-zinc-400 uppercase tracking-wider"
            htmlFor="company"
          >
            Company Name *
          </Label>
          <Input
            className="h-11 rounded-xl border-white/10 bg-[#060608] text-white placeholder:text-zinc-600 focus:border-white/25"
            id="company"
            onChange={(e) =>
              setFormData({ ...formData, company: e.target.value })
            }
            placeholder="Acme Corp"
            required
            type="text"
            value={formData.company}
          />
        </div>

        <div className="space-y-2">
          <Label
            className="font-mono text-[11px] text-zinc-400 uppercase tracking-wider"
            htmlFor="seats"
          >
            Estimated Workspace Seats
          </Label>
          <select
            className="flex h-11 w-full rounded-xl border border-white/10 bg-[#060608] px-3.5 text-sm text-white focus:border-white/25 focus:outline-none"
            id="seats"
            onChange={(e) =>
              setFormData({ ...formData, seats: e.target.value })
            }
            value={formData.seats}
          >
            <option value="1–4 seats (Pro Base)">1–4 seats (Pro Base)</option>
            <option value="5–10 seats (Pro Team)">5–10 seats (Pro Team)</option>
            <option value="11–25 seats (Growth)">11–25 seats (Growth)</option>
            <option value="25–100+ seats (Enterprise)">
              25–100+ seats (Enterprise)
            </option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label
          className="font-mono text-[11px] text-zinc-400 uppercase tracking-wider"
          htmlFor="message"
        >
          Workspace &amp; Integration Requirements *
        </Label>
        <Textarea
          className="min-h-[130px] rounded-xl border-white/10 bg-[#060608] text-white placeholder:text-zinc-600 focus:border-white/25"
          id="message"
          onChange={(e) =>
            setFormData({ ...formData, message: e.target.value })
          }
          placeholder="Tell us about your sales document workflow, target CRM stack (Salesforce, Zoho, HubSpot), or billing preferences..."
          required
          value={formData.message}
        />
      </div>

      <div className="pt-2">
        <Button
          className="group h-11 w-full cursor-pointer rounded-full bg-white font-semibold text-black text-sm shadow-[0_0_24px_rgba(255,255,255,0.14)] transition-all hover:bg-zinc-200 disabled:opacity-40"
          disabled={isSubmitting}
          size="lg"
          type="submit"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting Request...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1.5">
              <span>
                {selectedTopic === "pro"
                  ? "Request Pro Plan Activation"
                  : "Submit Inquiry"}
              </span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          )}
        </Button>
      </div>

      {submitStatus === "success" && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3.5 text-center text-emerald-400 text-xs sm:text-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>
            Request received. A Solutions Engineer will reach out within 2
            business hours with your workspace setup and billing details.
          </span>
        </div>
      )}

      {submitStatus === "error" && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 p-3.5 text-center text-red-400 text-xs sm:text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            Unable to send message right now. Please email support@salesient.com
            directly.
          </span>
        </div>
      )}
    </form>
  );
}
