import type { Metadata } from "next";
import { JetBrains_Mono, Manrope } from "next/font/google";

import AppProviders from "@/providers/app-providers";

import "@xyflow/react/dist/style.css";
import "./globals.css";

const adminSans = Manrope({
  variable: "--font-admin-sans",
  subsets: ["latin"],
});

const adminMono = JetBrains_Mono({
  variable: "--font-admin-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Textbooked Admin",
  description: "Textbooked admin dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${adminSans.variable} ${adminMono.variable} min-h-screen antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
