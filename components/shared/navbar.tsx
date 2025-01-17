'use client';

import Link from 'next/link';
import { useState } from 'react';
import { RiCompass3Line, RiHistoryLine, RiLogoutCircleLine, RiLoginCircleLine, RiMenuLine } from "react-icons/ri";
import { SiTrakt } from 'react-icons/si';
import { useTraktContext } from '@/context/traktContext';

export default function Navbar() {
    const { user, logout, isAuthenticated, login } = useTraktContext();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 backdrop-blur-xl border-b border-violet-500/10
                        transform transition-transform duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center h-16 justify-between">
                    {/* Logo and Home Link */}
                    <Link
                        href="/"
                        className="flex items-center text-white hover:text-violet-500 transition-colors duration-300"
                    >
                        <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white via-violet-300 to-white bg-clip-text text-transparent">
                            Show Compass
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden sm:flex items-center gap-2">
                        <Link
                            href="/history"
                            className="flex items-center gap-1.5 sm:gap-2.5 px-2 sm:px-4 py-2 text-white hover:text-violet-500 transition-colors duration-300 rounded-lg"
                        >
                            <RiHistoryLine className="text-lg sm:text-xl" />
                            <span className="text-sm sm:text-base font-medium">
                                History
                            </span>
                        </Link>

                        {isAuthenticated ? (
                            <button className="flex items-center gap-1.5 sm:gap-2.5 px-2 sm:px-4 py-2 text-white hover:text-violet-500 transition-colors duration-300 rounded-lg">
                                <SiTrakt className="text-lg sm:text-xl" />
                                <Link href="/trakt" className="text-sm sm:text-base font-medium">
                                    Trakt Account
                                </Link>
                            </button>
                        ) : (
                            <button onClick={login} className="flex items-center gap-1.5 sm:gap-2.5 px-2 sm:px-4 py-2 text-white hover:text-violet-500 transition-colors duration-300 rounded-lg">
                                <RiLoginCircleLine className="text-lg sm:text-xl" />
                                <span className="text-sm sm:text-base font-medium">
                                    Login With Trakt
                                </span>
                            </button>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="sm:hidden p-2 text-white hover:text-violet-500 transition-colors duration-300"
                    >
                        <RiMenuLine className="text-2xl" />
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="sm:hidden py-4 space-y-2">
                        <Link
                            href="/history"
                            className="flex items-center gap-2 px-4 py-3 text-white hover:text-violet-500 transition-colors duration-300"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <RiHistoryLine className="text-xl" />
                            <span className="text-base font-medium">History</span>
                        </Link>

                        {isAuthenticated ? (
                            <Link
                                href="/trakt"
                                className="flex items-center gap-2 px-4 py-3 text-white hover:text-violet-500 transition-colors duration-300"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <SiTrakt className="text-xl" />
                                <span className="text-base font-medium">Trakt Account</span>
                            </Link>
                        ) : (
                            <button 
                                onClick={() => {
                                    login();
                                    setIsMenuOpen(false);
                                }}
                                className="flex items-center gap-2 px-4 py-3 w-full text-left text-white hover:text-violet-500 transition-colors duration-300"
                            >
                                <RiLoginCircleLine className="text-xl" />
                                <span className="text-base font-medium">Login With Trakt</span>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}
