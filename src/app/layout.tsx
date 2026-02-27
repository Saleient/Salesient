import type { Metadata } from "next";
import "./globals.css";
import { GeistSans } from "geist/font/sans";
import { Toaster } from "@/components/ui/sonner";
import { WebVitals } from "@/lib/axiom/client";

export const metadata: Metadata = {
  title: "Salesient",
  description: "AI-powered sales intelligence platform",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://salesorbit.cp,"
  ), // so that og:url etc uses correct base
  openGraph: {
    title: "Salesient",
    description: "AI-powered sales intelligence platform",
    url: "/",
    siteName: "Salesient",
    images: [
      {
        url: "/",
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
    title: "Salesient",
    description: "AI-powered sales intelligence platform",
    images: ["/twitter-card.jpg"],
    // optional: handle twitter site/creator
    // site: "@YourTwitterHandle",
    // creator: "@YourTwitterHandle",
  },
  icons: [],
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
