import type { Metadata, Viewport } from "next";
import "../client/src/index.css";

export const metadata: Metadata = {
  title: "TRAIBOX",
  description:
    "AI-first trade workspace with a trust-first chat + cards workflow across compliance, finance, payments, and proofs.",
  openGraph: {
    title: "TRAIBOX",
    description:
      "AI-first trade workspace with a trust-first chat + cards workflow across compliance, finance, payments, and proofs.",
    type: "website",
    images: ["/opengraph.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "TRAIBOX",
    description:
      "AI-first trade workspace with a trust-first chat + cards workflow across compliance, finance, payments, and proofs.",
    images: ["/opengraph.jpg"],
  },
  icons: {
    icon: "/favicon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&family=Fraunces:opsz,wght@9..144,200..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
