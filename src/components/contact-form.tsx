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
    <form className="w-full space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label className="text-foreground" htmlFor="name">
          Name *
        </Label>
        <Input
          required
          className="border-white/10 bg-background/50"
          id="name"
          placeholder="Your name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-foreground" htmlFor="email">
          Email *
        </Label>
        <Input
          required
          className="border-white/10 bg-background/50"
          id="email"
          placeholder="your.email@company.com"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-foreground" htmlFor="company">
          Company
        </Label>
        <Input
          className="border-white/10 bg-background/50"
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
        <Label className="text-foreground" htmlFor="message">
          Message *
        </Label>
        <Textarea
          required
          className="min-h-[120px] border-white/10 bg-background/50"
          id="message"
          placeholder="How can we help you?"
          value={formData.message}
          onChange={(e) =>
            setFormData({ ...formData, message: e.target.value })
          }
        />
      </div>

      <Button
        className="w-full"
        disabled={isSubmitting}
        size="lg"
        type="submit"
      >
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>

      {submitStatus === "success" && (
        <p className="text-center text-green-500 text-sm">
          Thanks for reaching out! We&apos;ll get back to you soon.
        </p>
      )}

      {submitStatus === "error" && (
        <p className="text-center text-red-500 text-sm">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}
