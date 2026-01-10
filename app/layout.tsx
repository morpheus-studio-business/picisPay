import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#bef264",
};

export const metadata: Metadata = {
  metadataBase: new URL('https://picispay.id'),
  title: {
    default: "PicisPay - Aplikasi Konter & PPOB Terlengkap",
    template: "%s | PicisPay"
  },
  description: "Platform Top Up Game, Pulsa, Data, dan PPOB termurah dan terpercaya. Transaksi otomatis 24 jam dengan berbagai metode pembayaran.",
  keywords: ["top up game", "pulsa murah", "paket data", "ppob", "mobile legends", "free fire", "voucher game"],
  authors: [{ name: "PicisPay Team" }],
  creator: "PicisPay",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://picispay.id",
    title: "PicisPay - Solusi Top Up & PPOB",
    description: "Top Up Game & PPOB Termurah. Proses otomatis detik-an. Tersedia Mobile Legends, FF, Genshin Impact, dan ratusan game lainnya.",
    siteName: "PicisPay",
    images: [
      {
        url: "/og-image.jpg", // Ensure this exists or fallback to logo
        width: 1200,
        height: 630,
        alt: "PicisPay Banner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PicisPay - Aplikasi Konter & PPOB",
    description: "Solusi pembayaran digital termurah dan tercepat.",
    // images: ["/og-image.jpg"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PicisPay",
  },
};

import { SiteHeader } from "@/components/site-header";
import NotificationProvider from "@/components/NotificationProvider";

// ... existing code ...

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#121212] min-h-screen flex justify-center`}
      >
        <div className="w-full md:max-w-full md:w-full md:shadow-none max-w-[430px] bg-black min-h-screen shadow-2xl relative overflow-x-hidden flex flex-col">
          <SiteHeader />
          <NotificationProvider>
            <div className="w-full md:max-w-7xl md:mx-auto flex-1">
              {children}
            </div>
          </NotificationProvider>
        </div>
      </body>
    </html>
  );
}
