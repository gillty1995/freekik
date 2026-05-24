import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./(providers)/providers";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  metadataBase: new URL("https://freekik.net"),
  title: "FreeKik",
  description:
    "Live football match info, scores, stats, and more. Modern football app built with Next.js.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "FreeKik",
    description: "Live football match info, scores, stats, and more.",
    url: "https://freekik.net",
    siteName: "FreeKik",
    images: [
      {
        url: "/icons/og-image.png",
        width: 1200,
        height: 630,
        alt: "FreeKik Football App",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FreeKik",
    description: "Live football match info, scores, stats, and more.",
    images: ["/icons/og-image.png"],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-pwa-192x192.png" />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
