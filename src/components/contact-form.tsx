"use client";

import { ArrowRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({ name: "", email: "", company: "", message: "" });
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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label
            className="font-mono text-[11px] uppercase tracking-wider text-zinc-400"
            htmlFor="name"
          >
            Full Name *
          </Label>
          <Input
            required
            className="h-11 rounded-xl border-white/10 bg-[#060608] text-white placeholder:text-zinc-600 focus:border-white/25"
            id="name"
            placeholder="Alex Morgan"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label
            className="font-mono text-[11px] uppercase tracking-wider text-zinc-400"
            htmlFor="email"
          >
            Work Email *
          </Label>
          <Input
            required
            className="h-11 rounded-xl border-white/10 bg-[#060608] text-white placeholder:text-zinc-600 focus:border-white/25"
            id="email"
            placeholder="alex@company.com"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label
          className="font-mono text-[11px] uppercase tracking-wider text-zinc-400"
          htmlFor="company"
        >
          Company &amp; Team Size
        </Label>
        <Input
          className="h-11 rounded-xl border-white/10 bg-[#060608] text-white placeholder:text-zinc-600 focus:border-white/25"
          id="company"
          placeholder="Acme Corp · 25 Account Executives"
          type="text"
          value={formData.company}
          onChange={(e) =>
            setFormData({ ...formData, company: e.target.value })
          }
        />
      </div>

      <div className="space-y-2">
        <Label
          className="font-mono text-[11px] uppercase tracking-wider text-zinc-400"
          htmlFor="message"
        >
          How can we help? *
        </Label>
        <Textarea
          required
          className="min-h-[140px] rounded-xl border-white/10 bg-[#060608] text-white placeholder:text-zinc-600 focus:border-white/25"
          id="message"
          placeholder="Tell us about your sales document workflow, CRM stack, or security requirements..."
          value={formData.message}
          onChange={(e) =>
            setFormData({ ...formData, message: e.target.value })
          }
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
              Sending Inquiry...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1.5">
              <span>Send Message</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          )}
        </Button>
      </div>

      {submitStatus === "success" && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3.5 text-center text-emerald-400 text-xs sm:text-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>
            Inquiry received. A Solutions Engineer will respond shortly.
          </span>
        </div>
      )}

      {submitStatus === "error" && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 p-3.5 text-center text-red-400 text-xs sm:text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Unable to send message right now. Please try again.</span>
        </div>
      )}
    </form>
  );
}
