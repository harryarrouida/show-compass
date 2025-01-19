import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/navbar";
import Footer from '@/components/layout/footer';
import { TraktProvider } from '@/contexts/traktContext';
import { HistoryProvider } from '@/contexts/historyContext';
import { ToastProvider } from '@/contexts/toastContext';
import { Suspense } from 'react';
import Loading from '@/components/shared/loading';

const quicksand = Quicksand({ 
  subsets: ['latin'],
  variable: '--font-quicksand',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700']
});

export const metadata: Metadata = {
  title: "Movie Recommendations",
  description: "Find your next favorite movie or show",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${quicksand.variable} [scrollbar-width:none]`}>
      <body className="bg-neutral-950 min-h-screen flex flex-col antialiased font-sans relative [&::-webkit-scrollbar]:hidden">
        <ToastProvider>
          <TraktProvider>
            <HistoryProvider>
              <Navbar />
              <main className="flex-grow mb-16 relative">
                <Suspense fallback={<Loading text="Loading..." size="large" />}>
                  {children}
                </Suspense>
              </main>
              <Footer />
            </HistoryProvider>
          </TraktProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
