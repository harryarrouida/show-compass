import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/shared/navbar";
import Footer from '@/components/shared/footer';
import { TraktProvider } from '@/context/traktContext';
import { HistoryProvider } from '@/context/historyContext';
import { ToastProvider } from '@/context/toastContext';

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="en" className={inter.className}>
      <body className="bg-background text-zinc-100 min-h-screen flex flex-col antialiased">
        <ToastProvider>
          <TraktProvider>
            <HistoryProvider>
              <Navbar />
              <main className="flex-grow mb-16">
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
