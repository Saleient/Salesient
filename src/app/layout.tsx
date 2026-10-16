import type { Metadata } from "next";
import "./globals.css";
import { GeistSans } from "geist/font/sans";
import { Toaster } from "@/components/ui/sonner";
import { WebVitals } from "@/lib/axiom/client";

export const metadata: Metadata = {
  title: "Salesient | Revenue Intelligence Platform",
  description:
    "AI-powered sales intelligence platform grounded in your stack with zero hallucinations.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://salesorbit.cp,"
  ), // so that og:url etc uses correct base
  openGraph: {
    title: "Salesient | Revenue Intelligence Platform",
    description: "AI-powered sales intelligence platform",
    url: "/",
    siteName: "Salesient",
    images: [
      {
        url: "/salesient-logo.png",
        width: 1200,
        height: 630,
        alt: "Salesient - AI Sales Intelligence",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Salesient | Revenue Intelligence Platform",
    description: "AI-powered sales intelligence platform",
    images: ["/salesient-logo.png"],
  },
  icons: [
    { rel: "icon", url: "/favicon.ico" },
    { rel: "icon", type: "image/png", url: "/salesient-mark.png" },
    { rel: "apple-touch-icon", url: "/salesient-mark.png" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressContentEditableWarning suppressHydrationWarning>
      <WebVitals />

      <body
        className={`relative antialiased ${GeistSans.className}`}
        suppressContentEditableWarning
        suppressHydrationWarning
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
