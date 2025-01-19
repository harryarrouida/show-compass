import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/shared/navbar";
import Footer from '@/components/shared/footer';
import { TraktProvider } from '@/context/traktContext';
import { HistoryProvider } from '@/context/historyContext';
import { ToastProvider } from '@/context/toastContext';
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
    <html lang="en" className={`${quicksand.variable} [scrollbar-width:thin] [scrollbar-color:rgb(161_161_170)_transparent]`}>
      <body className="bg-neutral-950 min-h-screen flex flex-col antialiased font-sans relative [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-violet-400 [&::-webkit-scrollbar-thumb]:rounded-full">
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
