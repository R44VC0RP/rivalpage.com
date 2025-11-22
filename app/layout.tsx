import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const marlin = localFont({
  src: "../public/fonts/MarlinSoftSQ-Bold.woff2",
  variable: "--font-marlin",
  weight: "700",
});

const inter = localFont({
  src: "../public/fonts/inter-var-latin.woff2",
  variable: "--font-inter",
  weight: "100 900", // Variable font range
});

const favorit = localFont({
  src: "../public/fonts/ABCFavoritMono-Bold.woff2",
  variable: "--font-favorit",
  weight: "700",
});

export const metadata: Metadata = {
  title: "RivalPage",
  description: "Know what your competitors are doing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${marlin.variable} ${inter.variable} ${favorit.variable} antialiased font-sans`}
      >
        <NuqsAdapter>
          {children}
        </NuqsAdapter>
      </body>
    </html>
  );
}
