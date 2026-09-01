import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Get2Know",
  description:
    "An interactive question-and-answer game for getting to know a potential partner.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cream text-plum antialiased">{children}</body>
    </html>
  );
}
