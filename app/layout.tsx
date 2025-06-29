import * as React from "react";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Newsreader } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { ThemeContext } from "@/components/ThemeContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { cn } from "@/lib/utils";
import packageJson from "@/package.json";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { template: `%s | ${packageJson.name}`, default: packageJson.name },
  description: packageJson.description,
  ...(process.env.NEXT_PUBLIC_BASE_URL
    ? {
        metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL),
      }
    : {}),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn(inter.variable, newsreader.variable, jetBrainsMono.variable)}
      suppressHydrationWarning
    >
      <body className={"flex min-h-screen flex-col antialiased"}>
        <ThemeContext attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Header />
          <main className="mx-auto flex w-full max-w-5/6 grow flex-col sm:px-8">{children}</main>
          <Footer />
        </ThemeContext>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
