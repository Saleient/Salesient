"use client";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SalesientLogo } from "@/components/sections/home/navbar";
import { signIn } from "@/lib/auth-client";

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [_showMagicLink, setShowMagicLink] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Clear cookies only after component fully mounts and renders
  useEffect(() => {
    setMounted(true);

    const frameId = requestAnimationFrame(() => {
      const cookies = document.cookie.split(";");
      for (const cookie of cookies) {
        const cookieName = cookie.split("=")[0].trim();
        if (cookieName) {
          document.cookie = `${cookieName}=; max-age=0; path=/`;
          document.cookie = `${cookieName}=; max-age=0; path=/; domain=${window.location.hostname}`;
        }
      }
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/check-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.exists) {
        await signIn.magicLink({
          email,
          callbackURL: "/dashboard",
        });
        setMagicLinkSent(true);
        toast.success("Magic link sent! Check your email.");
      } else {
        setIsNewUser(true);
        setShowNameInput(true);
      }
    } catch (error) {
      console.error("Email verification error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!(email && name)) {
      toast.error("Please enter your name");
      return;
    }

    setLoading(true);

    try {
      await signIn.magicLink({
        email,
        name,
        callbackURL: "/dashboard",
      });

      setMagicLinkSent(true);
      toast.success("Magic link sent! Check your email.");
    } catch (error) {
      console.error("Magic link error:", error);
      toast.error("Failed to send magic link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async (value: string) => {
    if (!value) {
      return;
    }

    setVerifyingOtp(true);
    setOtp(value);

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: value }),
      });

      const data = await response.json();

      if (data.success && data.redirectUrl) {
        toast.success("Verification successful! Redirecting...");
        window.location.href = data.redirectUrl;
      } else {
        toast.error(data.error || "Invalid code. Please try again.");
        setOtp("");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      toast.error("Failed to verify code. Please try again.");
      setOtp("");
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-[#050507] px-4 py-8 text-white sm:px-8">
      {/* Architectural Grid & Top Illumination */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grid-subtle [mask-image:radial-gradient(ellipse_70%_55%_at_50%_30%,#000_25%,transparent_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-36 left-1/2 h-96 w-[720px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06)_0%,transparent_70%)] blur-2xl"
      />

      {/* Top Navigation Bar */}
      <div className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between">
        <Link href="/" className="focus:outline-none">
          <SalesientLogo />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Overview</span>
        </Link>
      </div>

      {/* Main Centered Auth Portal */}
      <div className="relative z-10 mx-auto my-12 w-full max-w-[440px]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-3xl border border-white/[0.09] bg-[#09090c] p-7 shadow-[0_24px_80px_-16px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-9"
        >
          <div className="space-y-6 text-left">
            {/* Badge + Header */}
            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                <Lock className="h-3 w-3 text-emerald-400" />
                <span>Zero-Trust Workspace Auth</span>
              </div>
              <h1 className="font-semibold text-2xl tracking-tight text-white sm:text-3xl">
                {isNewUser ? "Create your workspace" : "Sign in to Salesient"}
              </h1>
              <p className="text-xs text-zinc-400 leading-relaxed sm:text-sm">
                {magicLinkSent &&
                  "We dispatched a one-time verification code and magic link."}
                {isNewUser &&
                  !magicLinkSent &&
                  "Complete your profile to initialize your isolated knowledge vault."}
                {!(isNewUser || magicLinkSent) &&
                  "Enter your work email for instant passwordless access."}
              </p>
            </div>

            {magicLinkSent ? (
              <div className="space-y-5 rounded-2xl border border-white/[0.08] bg-[#060608] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-500/10">
                    <Mail className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm text-white">
                      Check your inbox
                    </h3>
                    <p className="truncate text-xs text-zinc-400">{email}</p>
                  </div>
                </div>

                {/* OTP Input */}
                <div className="space-y-3 border-t border-white/[0.06] pt-4">
                  <label
                    className="block font-mono text-[11px] uppercase tracking-wider text-zinc-400"
                    htmlFor="otp"
                  >
                    Verification Code
                  </label>
                  <input
                    className="flex h-11 w-full rounded-xl border border-white/10 bg-[#09090c] px-4 font-mono text-sm tracking-widest text-white transition-colors placeholder:font-sans placeholder:tracking-normal placeholder:text-zinc-600 focus:border-white/25 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={verifyingOtp}
                    id="otp"
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit code"
                    value={otp}
                  />
                  <button
                    className="flex h-11 w-full cursor-pointer items-center justify-center rounded-full bg-white px-4 font-semibold text-xs text-black transition-all hover:bg-zinc-200 disabled:pointer-events-none disabled:opacity-40 sm:text-sm"
                    disabled={verifyingOtp || !otp}
                    onClick={() => handleOtpVerification(otp)}
                    type="button"
                  >
                    {verifyingOtp ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying Code...
                      </>
                    ) : (
                      "Verify & Open Workspace"
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs">
                  <button
                    className="cursor-pointer font-medium text-zinc-400 transition-colors hover:text-white"
                    disabled={verifyingOtp}
                    onClick={async () => {
                      setLoading(true);
                      try {
                        if (isNewUser) {
                          await signIn.magicLink({
                            email,
                            name,
                            callbackURL: "/dashboard",
                          });
                        } else {
                          await signIn.magicLink({
                            email,
                            callbackURL: "/dashboard",
                          });
                        }
                        toast.success("New code sent! Check your email.");
                      } catch (_error) {
                        toast.error("Failed to resend code.");
                      } finally {
                        setLoading(false);
                      }
                    }}
                    type="button"
                  >
                    Resend code
                  </button>
                  <button
                    className="cursor-pointer font-medium text-zinc-300 transition-colors hover:text-white"
                    disabled={verifyingOtp}
                    onClick={() => {
                      setMagicLinkSent(false);
                      setShowMagicLink(false);
                      setShowNameInput(false);
                      setIsNewUser(false);
                      setEmail("");
                      setName("");
                      setOtp("");
                    }}
                    type="button"
                  >
                    Use different email
                  </button>
                </div>
              </div>
            ) : (
              <>
                {showNameInput && (
                  <form className="space-y-4" onSubmit={handleMagicLinkSubmit}>
                    <div className="space-y-2">
                      <label
                        className="font-mono text-[11px] uppercase tracking-wider text-zinc-400"
                        htmlFor="email"
                      >
                        Work Email
                      </label>
                      <input
                        className="flex h-11 w-full rounded-xl border border-white/10 bg-[#060608] px-4 text-sm text-zinc-400 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled
                        id="email"
                        type="email"
                        value={email}
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        className="font-mono text-[11px] uppercase tracking-wider text-zinc-400"
                        htmlFor="name"
                      >
                        Full Name
                      </label>
                      <input
                        className="flex h-11 w-full rounded-xl border border-white/10 bg-[#060608] px-4 text-sm text-white transition-colors placeholder:text-zinc-600 focus:border-white/25 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={loading}
                        id="name"
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        required
                        type="text"
                        value={name}
                      />
                    </div>
                    <button
                      className="group flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-white font-semibold text-xs text-black shadow-[0_0_24px_rgba(255,255,255,0.14)] transition-all hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                      disabled={loading || !mounted}
                      type="submit"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Sending Magic Link...</span>
                        </>
                      ) : (
                        <>
                          <span>Continue with Magic Link</span>
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </>
                      )}
                    </button>
                    <button
                      className="w-full cursor-pointer pt-1 text-center font-medium text-xs text-zinc-400 transition-colors hover:text-white"
                      disabled={loading}
                      onClick={() => {
                        setShowNameInput(false);
                        setEmail("");
                        setName("");
                      }}
                      type="button"
                    >
                      Use a different email address
                    </button>
                  </form>
                )}

                {!showNameInput && (
                  <form className="space-y-4" onSubmit={handleEmailSubmit}>
                    <div className="space-y-2">
                      <label
                        className="font-mono text-[11px] uppercase tracking-wider text-zinc-400"
                        htmlFor="email"
                      >
                        Work Email
                      </label>
                      <input
                        className="flex h-11 w-full rounded-xl border border-white/10 bg-[#060608] px-4 text-sm text-white transition-colors placeholder:text-zinc-600 focus:border-white/25 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={loading}
                        id="email"
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        required
                        type="email"
                        value={email}
                      />
                    </div>
                    <button
                      className="group flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-white font-semibold text-xs text-black shadow-[0_0_24px_rgba(255,255,255,0.14)] transition-all hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                      disabled={loading || !mounted}
                      type="submit"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <>
                          <span>Continue with Email</span>
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </>
            )}

            {/* Security Reassurance */}
            <div className="border-t border-white/[0.06] pt-5">
              <div className="flex items-center justify-between text-[11px] text-zinc-500">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>SOC 2 Type II Secured</span>
                </span>
                <span>Passwordless OTP</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Legal Note */}
      <div className="relative z-10 mx-auto max-w-md text-center text-xs text-zinc-500">
        Need help accessing your organization workspace?{" "}
        <Link
          href="/contact"
          className="text-zinc-300 underline underline-offset-4 hover:text-white"
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
}
