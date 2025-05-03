import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import { BlockchainProvider } from "@/context/BlockchainContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Blockchain System",
  description: "A blockchain system with voting, explorer, and node management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="blockchain-theme"
        >
          <BlockchainProvider>
            <div className="min-h-screen bg-background">
              <Navbar />
              <main className="container mx-auto px-4 py-8">{children}</main>
              <Toaster position="top-right" />
            </div>
          </BlockchainProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
