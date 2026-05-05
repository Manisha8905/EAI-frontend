import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Toaster from "../app/Componets/Toaster";
import LayoutWrapper from "./LayoutWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI SDR",
  description: "Enterprise AI  Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jakarta.variable} antialiased h-screen overflow-hidden`} suppressHydrationWarning>
        <Providers>
          <LayoutWrapper>{children}</LayoutWrapper>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}