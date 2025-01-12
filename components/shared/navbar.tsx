'use client';

import Link from 'next/link';
import { IoCompassOutline, IoListOutline, IoLogOut, IoLogIn } from "react-icons/io5";
import { SiTrakt } from 'react-icons/si';
import { useTraktContext } from '@/context/traktContext';

export default function Navbar() {
    const { user, logout, isAuthenticated, login } = useTraktContext();
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

                        {isAuthenticated ? (
                            <button className="flex items-center gap-2.5 px-4 py-2 text-white hover:text-zinc-200 transition-all duration-300 rounded-lg hover:bg-zinc-800">
                                <SiTrakt className="text-xl" />
                                <Link href="/trakt" className="text-base font-medium">
                                    Trakt
                                </Link>
                            </button>
                        ) : (
                            <button onClick={login} className="flex items-center gap-2.5 px-4 py-2 text-white hover:text-zinc-200 transition-all duration-300 rounded-lg hover:bg-zinc-800">
                                <IoLogIn className="text-xl" />
                                <span className="text-base font-medium">
                                    Login
                                </span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
