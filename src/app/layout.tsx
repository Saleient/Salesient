import type { Metadata } from "next";
import "./globals.css";
import { GeistSans } from "geist/font/sans";
import { Toaster } from "@/components/ui/sonner";
import { WebVitals } from "@/lib/axiom/client";

export const metadata: Metadata = {
  title: "Elitenotes",
  description: "Your go-to app for everything sales",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://elitenotes.xyz"
  ), // so that og:url etc uses correct base
  openGraph: {
    title: "Elitenotes",
    description: "Your go-to app for everything sales",
    url: "/",
    siteName: "Elitenotes",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Elitenotes - Sales app screenshot",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Elitenotes",
    description: "Your go-to app for everything sales",
    images: ["/twitter-card.jpg"],
    // optional: handle twitter site/creator
    // site: "@YourTwitterHandle",
    // creator: "@YourTwitterHandle",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
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
