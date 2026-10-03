import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Measure Flow — Break the happy path",
  description: "Explore a mobile failure, design a recovery with Stitch, and discover what Measure sees in your real app.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
