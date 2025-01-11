'use client';

import Link from 'next/link';

export default function Navbar() {

    return (
        <nav className="sticky top-0 z-50 bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800/50">
            <div className="max-w-6xl mx-auto px-8">
                <div className="flex items-center h-[60px] justify-between">
                    {/* Logo and Home Link */}
                    <Link
                        href="/"
                        className="flex items-center text-zinc-100 hover:text-zinc-300 transition-colors duration-300"
                    >
                        <span className="text-2xl font-bold bg-gradient-to-r from-zinc-200 via-zinc-400 to-zinc-200 bg-clip-text text-transparent">
                            Show Compass
                        </span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/saved" className="text-zinc-100 hover:text-zinc-300 transition-colors duration-300">
                            Saved
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
