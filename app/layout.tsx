import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/navbar";
import Footer from '@/components/layout/footer';
import { TraktProvider } from '@/contexts/traktContext';
import { HistoryProvider } from '@/contexts/historyContext';
import { ToastProvider } from '@/contexts/toastContext';
import { Suspense } from 'react';
import Loading from '@/components/shared/loaders/loading';
import { GenerationsProvider } from "@/contexts/GenerationsContext";

const quicksand = Quicksand({ 
  subsets: ['latin'],
  variable: '--font-quicksand',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700']
});

export const metadata: Metadata = {
  title: "Showcompass",
  description: "Your AI Guide to the Best Shows",
  manifest: "/manifest.json",
  themeColor: "#ffffff",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "showcompass"
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isSomethingHappening = false;

  const mainContent = isSomethingHappening ? (
    <div className="min-h-screen flex items-center justify-center bg-[#111111]">
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-white">
          We&apos;re Currently Experiencing Some Issues
        </h1>
        <div className="space-y-4 text-zinc-400">
          <p className="text-lg">
            We&apos;re working hard to resolve this and get everything back to normal.
          </p>
          <p>
            This may be due to scheduled maintenance or unexpected technical difficulties.
            Please check back in a little while.
          </p>
        </div>
        <div className="pt-4">
          <div className="inline-flex items-center gap-2 text-violet-400">
            <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
            <span>System Status: Updating</span>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <main className="flex-grow mb-16 relative">
      <Suspense fallback={<Loading text="Loading..." />}>
        {children}
      </Suspense>
    </main>
  );

  return (
    <html lang="en" className={`${quicksand.variable} [scrollbar-width:none]`}>
      <head>
        <meta name="application-name" content="showcompass" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="showcompass" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="icon" href={`${process.env.NEXT_PUBLIC_BASE_URL}/public/icon.JPG`} />
        <link rel="apple-touch-icon" href={`${process.env.NEXT_PUBLIC_BASE_URL}/public/icon.JPG`} />
      </head>
      <body className="bg-[#111111] min-h-screen flex flex-col antialiased font-sans relative [&::-webkit-scrollbar]:hidden">
        <ToastProvider>
          <TraktProvider>
            <HistoryProvider>
              <GenerationsProvider>
                <Navbar />
                {mainContent}
                <Footer />
              </GenerationsProvider>
            </HistoryProvider>
          </TraktProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
