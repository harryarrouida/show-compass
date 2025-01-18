import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/shared/navbar";
import Footer from '@/components/shared/footer';
import { TraktProvider } from '@/context/traktContext';
import { HistoryProvider } from '@/context/historyContext';
import { ToastProvider } from '@/context/toastContext';

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
    <html lang="en" className={quicksand.variable}>
      <body className="bg-neutral-950 min-h-screen flex flex-col antialiased font-sans relative">
        <ToastProvider>
          <TraktProvider>
            <HistoryProvider>
              <Navbar />
              <main className="flex-grow mb-16 relative">
                {children}
              </main>
              <Footer />
            </HistoryProvider>
          </TraktProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
