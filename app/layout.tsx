import type { Metadata } from "next";
import { DotGothic16, Space_Mono } from "next/font/google";
import "./globals.css";

const display = DotGothic16({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const mono = Space_Mono({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Tmail Zanara — Temporary Mail",
  description:
    "Disposable inboxes on domains you own. Open source, no signup, wiped every night at 01:00 WIB.",
  openGraph: {
    title: "Tmail Zanara — Temporary Mail",
    description:
      "Disposable inboxes on domains you own. Open source, no signup, wiped every night.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
