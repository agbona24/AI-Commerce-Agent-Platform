import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Nexus AI | Your AI-Powered Business Assistant",
  description: "Transform your business with AI agents that handle calls, WhatsApp messages, and customer support 24/7. Set up your AI receptionist in 5 minutes.",
  keywords: ["AI receptionist", "WhatsApp automation", "voice AI", "customer support AI", "sales automation"],
  openGraph: {
    title: "Nexus AI | Your AI-Powered Business Assistant",
    description: "AI agents that handle calls, messages, and support 24/7",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
