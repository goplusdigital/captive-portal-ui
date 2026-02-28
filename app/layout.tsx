import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import 'sweetalert2/dist/sweetalert2.css'
import LiffProvider from "./libs/LiffProvider";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
// local font example
import localFont from "next/font/local"
const fontPrompt = localFont({
  src: [
    {
      path: "./fonts/Prompt/Prompt-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Prompt/Prompt-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  title: "Internet Access Portal",
  description: "A captive portal for internet access management.",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  robots : "noindex, nofollow",
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fontPrompt.className} antialiased`}
      >
        <LiffProvider>{children}</LiffProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
