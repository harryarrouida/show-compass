'use client';

import Link from 'next/link';
import { IoCompassOutline, IoListOutline } from "react-icons/io5";

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 bg-zinc-900/50 backdrop-blur-xl border-b border-zinc-800">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                <div className="flex items-center h-16 justify-between">
                    {/* Logo and Home Link */}
                    <Link
                        href="/"
                        className="flex items-center text-white hover:text-zinc-200 transition-colors duration-300"
                    >
                        <span className="text-2xl font-bold bg-gradient-to-r from-white via-zinc-300 to-white bg-clip-text text-transparent">
                            Show Compass
                        </span>
                    </Link>

                    <div className="flex items-center">
                        <Link 
                            href="/history" 
                            className="flex items-center gap-2.5 px-4 py-2 text-white hover:text-zinc-200 transition-all duration-300 rounded-lg hover:bg-zinc-800"
                        >
                            <IoListOutline className="text-xl" />
                            <span className="text-base font-medium">
                                History
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
