import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from '@/components/shared/footer';

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
    <html lang="en">
      <body className={`${inter.className} bg-zinc-950 text-zinc-100 antialiased`}>
        <Navbar />
        <main className="flex-grow mb-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
