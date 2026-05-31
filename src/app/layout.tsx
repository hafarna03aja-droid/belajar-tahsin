import type { Metadata, Viewport } from "next";
import { Inter, Amiri } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: "QuranEdutech — Belajar Al-Qur'an Berbasis AI",
    template: "%s | QuranEdutech",
  },
  description:
    "Platform edutech modern untuk belajar membaca Al-Qur'an dengan koreksi pelafalan AI real-time dan bimbingan Ustadz terverifikasi.",
  keywords: ["belajar quran", "tajwid", "makhraj", "tahsin", "AI quran"],
  authors: [{ name: "QuranEdutech" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f1923",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${inter.variable} ${amiri.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
