"use client";

import { HomeIcon, Loader2, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { signIn } from "@/lib/auth-client";

/**
 * Google icon component
 */
const GoogleIcon = (props: React.ComponentProps<"svg">) => (
  <svg preserveAspectRatio="xMidYMid" viewBox="0 0 256 262" {...props}>
    <title>Google logo</title>
    <path
      d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
      fill="#4285F4"
    />
    <path
      d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
      fill="#34A853"
    />
    <path
      d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
      fill="#FBBC05"
    />
    <path
      d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
      fill="#EB4335"
    />
  </svg>
);

/**
 * Authentication page with split screen layout
 */
export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showMagicLink, setShowMagicLink] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Clear cookies only after component fully mounts and renders
  useEffect(() => {
    // Mark as mounted after render
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
      // Check if user exists
      const response = await fetch("/api/auth/check-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.exists) {
        // User exists, send magic link directly
        await signIn.magicLink({
          email,
          callbackURL: "/dashboard",
        });
        setMagicLinkSent(true);
        toast.success("Magic link sent! Check your email.");
      } else {
        // New user, show name input
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
    <div className="relative flex min-h-screen items-center justify-center">
      {/* Full background image */}
      <Image
        alt="Background"
        className="absolute inset-0 object-cover opacity-60"
        fill
        priority
        src="/bg.png"
      />

      {/* Home Button */}
      <Link
        className="absolute top-8 left-8 z-20 inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 font-medium text-sm ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        href="/"
      >
        <HomeIcon className="mr-2 h-4 w-4" />
        Home
      </Link>

      {/* Centered card with sign in form */}
      <div className="relative z-10 mx-4 w-full max-w-[420px] rounded-lg border border-input bg-background/95 p-8 shadow-lg backdrop-blur-sm">
        {/* Sign in form content - centered block, left-aligned text within */}
        <div className="space-y-8 text-left">
          {/* Header */}
          <div className="space-y-3">
            <h2 className="font-semibold text-3xl tracking-tight">
              {isNewUser ? "Welcome!" : "Welcome to EliteNotes"}
            </h2>
            <p className="text-muted-foreground">
              {magicLinkSent && "Check your email for the magic link"}
              {isNewUser &&
                !magicLinkSent &&
                "Please enter your name to complete registration"}
              {!(isNewUser || magicLinkSent) &&
                "Sign in to continue to your account"}
            </p>
          </div>

          {magicLinkSent ? (
            <div className="space-y-6 rounded-lg border border-input bg-muted/50 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-base">Check your email</h3>
                  <p className="text-muted-foreground text-sm">
                    We sent a magic link to {email}
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm">
                Click the link in the email to sign in, or enter the 6-digit
                code below.
              </p>

              {/* OTP Input */}
              <div className="space-y-3">
                <label className="block font-medium text-sm" htmlFor="otp">
                  Enter verification code
                </label>
                <input
                  className="flex h-12 w-full rounded-lg border border-input bg-background px-4 font-medium text-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={verifyingOtp}
                  id="otp"
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter the code from your email"
                  value={otp}
                />
                <button
                  className="flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 font-medium text-sm ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                  disabled={verifyingOtp || !otp}
                  onClick={() => handleOtpVerification(otp)}
                  type="button"
                >
                  {verifyingOtp ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Code"
                  )}
                </button>
                {verifyingOtp && (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifying...</span>
                  </div>
                )}
              </div>

              <div className="flex flex-row justify-between space-x-2 pt-2">
                <button
                  className="w-fit font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
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
                  className="block w-fit font-medium text-primary text-sm transition-colors hover:text-primary/80"
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
                  Try a different email
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Google Sign In Button */}
              <button
                className="group relative flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-input bg-background font-medium text-sm shadow-sm transition-all duration-200 hover:bg-muted hover:shadow disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading || !mounted}
                onClick={async () => {
                  await signIn.social(
                    {
                      provider: "google",
                      callbackURL: "/dashboard",
                    },
                    {
                      onRequest: () => {
                        setLoading(true);
                      },
                      onError: () => {
                        setLoading(false);
                      },
                    }
                  );
                }}
                type="button"
              >
                <div className="flex h-5 w-5 items-center justify-center">
                  {loading && !showMagicLink ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <GoogleIcon className="h-5 w-5" />
                  )}
                </div>
                <span className="text-foreground">
                  {loading && !showMagicLink
                    ? "Signing in..."
                    : "Continue with Google"}
                </span>
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Magic Link Form */}
              {showMagicLink && showNameInput && (
                <form className="space-y-4" onSubmit={handleMagicLinkSubmit}>
                  <div className="space-y-2">
                    <label className="font-medium text-sm" htmlFor="email">
                      Email
                    </label>
                    <input
                      className="flex h-12 w-full rounded-lg border border-input bg-background px-4 font-medium text-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled
                      id="email"
                      type="email"
                      value={email}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-medium text-sm" htmlFor="name">
                      Name
                    </label>
                    <input
                      className="flex h-12 w-full rounded-lg border border-input bg-background px-4 font-medium text-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={loading}
                      id="name"
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      required
                      type="text"
                      value={name}
                    />
                  </div>
                  <button
                    className="group relative flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-input bg-background font-medium text-sm shadow-sm transition-all duration-200 hover:bg-muted hover:shadow disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={loading || !mounted}
                    type="submit"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-foreground">Sending...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="h-5 w-5" />
                        <span className="text-foreground">Send Magic Link</span>
                      </>
                    )}
                  </button>
                  <button
                    className="w-full text-center font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
                    disabled={loading}
                    onClick={() => {
                      setShowNameInput(false);
                      setEmail("");
                      setName("");
                    }}
                    type="button"
                  >
                    Use a different email
                  </button>
                </form>
              )}

              {showMagicLink && !showNameInput && (
                <form className="space-y-4" onSubmit={handleEmailSubmit}>
                  <div className="space-y-2">
                    <label className="font-medium text-sm" htmlFor="email">
                      Email
                    </label>
                    <input
                      className="flex h-12 w-full rounded-lg border border-input bg-background px-4 font-medium text-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={loading}
                      id="email"
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      type="email"
                      value={email}
                    />
                  </div>
                  <button
                    className="group relative flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-input bg-background font-medium text-sm shadow-sm transition-all duration-200 hover:bg-muted hover:shadow disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={loading || !mounted}
                    type="submit"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-foreground">Verifying...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="h-5 w-5" />
                        <span className="text-foreground">Continue</span>
                      </>
                    )}
                  </button>
                  <button
                    className="w-full text-center font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
                    disabled={loading}
                    onClick={() => setShowMagicLink(false)}
                    type="button"
                  >
                    Back to sign in options
                  </button>
                </form>
              )}

              {!showMagicLink && (
                <button
                  className="group relative flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-input bg-background font-medium text-sm shadow-sm transition-all duration-200 hover:bg-muted hover:shadow disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={loading || !mounted}
                  onClick={() => setShowMagicLink(true)}
                  type="button"
                >
                  <Mail className="h-5 w-5" />
                  <span className="text-foreground">Continue with Email</span>
                </button>
              )}
            </>
          )}

          {/* Footer */}
          <div className="space-y-4">
            <p className="text-muted-foreground/70 text-xs leading-relaxed">
              By continuing, you agree to our{" "}
              <Link
                className="underline underline-offset-2 hover:text-foreground"
                href="/terms"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                className="underline underline-offset-2 hover:text-foreground"
                href="/privacy-policy"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
