"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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
            className="text-xs tracking-wider text-white/50 uppercase"
            htmlFor="name"
          >
            Name *
          </Label>
          <Input
            required
            className="border-white/[0.06] bg-white/[0.02] text-white placeholder:text-white/20 focus:border-white/15 focus:ring-white/5"
            id="name"
            placeholder="Your name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label
            className="text-xs tracking-wider text-white/50 uppercase"
            htmlFor="email"
          >
            Email *
          </Label>
          <Input
            required
            className="border-white/[0.06] bg-white/[0.02] text-white placeholder:text-white/20 focus:border-white/15 focus:ring-white/5"
            id="email"
            placeholder="you@company.com"
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
          className="text-xs tracking-wider text-white/50 uppercase"
          htmlFor="company"
        >
          Company
        </Label>
        <Input
          className="border-white/[0.06] bg-white/[0.02] text-white placeholder:text-white/20 focus:border-white/15 focus:ring-white/5"
          id="company"
          placeholder="Your company name"
          type="text"
          value={formData.company}
          onChange={(e) =>
            setFormData({ ...formData, company: e.target.value })
          }
        />
      </div>

      <div className="space-y-2">
        <Label
          className="text-xs tracking-wider text-white/50 uppercase"
          htmlFor="message"
        >
          Message *
        </Label>
        <Textarea
          required
          className="min-h-[140px] border-white/[0.06] bg-white/[0.02] text-white placeholder:text-white/20 focus:border-white/15 focus:ring-white/5"
          id="message"
          placeholder="Tell us how we can help..."
          value={formData.message}
          onChange={(e) =>
            setFormData({ ...formData, message: e.target.value })
          }
        />
      </div>

      <div className="pt-2">
        <Button
          className="w-full rounded-full bg-white py-5 font-medium text-black transition-all hover:bg-white/90 disabled:opacity-40"
          disabled={isSubmitting}
          size="lg"
          type="submit"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Loading</title>
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  fill="currentColor"
                />
              </svg>
              Sending...
            </span>
          ) : (
            "Send Message →"
          )}
        </Button>
      </div>

      {submitStatus === "success" && (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-center text-emerald-400 text-sm">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Success</title>
            <path
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Thanks for reaching out! We&apos;ll get back to you soon.
        </div>
      )}

      {submitStatus === "error" && (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-center text-red-400 text-sm">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Error</title>
            <path
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Something went wrong. Please try again.
        </div>
      )}
    </form>
  );
}
