import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "@/src/providers/QueryProvider";
import WagmiProvider from "@/src/providers/WagmiProvider";
import { WalletProvider } from "@/src/providers/WalletProvider";

export const metadata: Metadata = {
  title: "CETAS",
  description: "Grid-based roguelike auto-battler strategy — Fully On-Chain on Celo L2",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        {/* home_bg preload — CSS background-image tidak di-handle next/image */}
        <link rel="preload" as="image" href="/home_bg.png" />
        <link rel="preload" as="image" href="/landing-bg.jpg" />
        {/* Talentapp verification */}
        <meta name="talentapp:project_verification" content="d33ef4f31d08e7aac18845b0ade189c4e376d018ffab47af7d1a1517eb92a6ea3ed6035827d7e3bb49b64fcaa8b0848dde2624e7ba25fb3fd6ee54c0fd44bdc3" />
      </head>
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <WagmiProvider>
            <WalletProvider>
              {children}
            </WalletProvider>
          </WagmiProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
