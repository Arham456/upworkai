import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "RefinedHawk — Win More Jobs",
  description: "RefinedHawk branding application",
  icons: {
    icon: "/hawk.png",
    shortcut: "/hawk.png",
    apple: "/hawk.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <head>
        <link rel="icon" href="/hawk.png" type="image/png" />
        <link rel="shortcut icon" href="/hawk.png" type="image/png" />
        <link rel="apple-touch-icon" href="/hawk.png" />
      </head>
      <body className="h-full antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
