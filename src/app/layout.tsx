import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { MotionPreferences } from "@/components/layout/MotionPreferences";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { UserDataSync } from "@/components/auth/UserDataSync";
import "./globals.css";

export const metadata: Metadata = {
  title: "CardEdge — Poker & Blackjack Decision Intelligence",
  description:
    "Training and probability tool for Texas Hold'em poker equity and blackjack basic strategy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col felt-gradient">
        <AuthProvider>
          <UserDataSync />
          <MotionPreferences>{children}</MotionPreferences>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
