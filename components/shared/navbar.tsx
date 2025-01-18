'use client';

import Link from 'next/link';
import { useState } from 'react';
import { RiHistoryLine, RiLoginCircleLine, RiMenuLine, RiSaveLine } from "react-icons/ri";
import { SiTrakt } from 'react-icons/si';
import { useTraktContext } from '@/context/traktContext';

export default function Navbar() {
    const { isAuthenticated, login } = useTraktContext();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center h-16 justify-between">
                    {/* Logo */}
                    <Link href="/" className="group">
                        <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white via-violet-300 to-white bg-clip-text text-transparent transition-all duration-300 group-hover:via-violet-400">
                            Show Compass
                        </h1>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden sm:flex items-center gap-3">
                        <Link
                            href="/history"
                            className="flex items-center gap-2 px-4 py-2 text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-300"
                        >
                            <RiSaveLine className="text-xl" />
                            <span className="font-medium">Saved</span>
                        </Link>

                        {isAuthenticated ? (
                            <Link 
                                href="/trakt"
                                className="flex items-center gap-2 px-4 py-2 text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-300"
                            >
                                <SiTrakt className="text-xl" />
                                <span className="font-medium">Trakt Account</span>
                            </Link>
                        ) : (
                            <button 
                                onClick={login}
                                className="flex items-center gap-2 px-4 py-2 text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-300"
                            >
                                <RiLoginCircleLine className="text-xl" />
                                <span className="font-medium">Login With Trakt</span>
                            </button>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="sm:hidden p-2 text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-300"
                        aria-label="Toggle menu"
                    >
                        <RiMenuLine className="text-2xl" />
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="sm:hidden py-2 border-t border-zinc-800/50">
                        <Link
                            href="/history"
                            className="flex items-center gap-2 px-4 py-3 text-zinc-300 hover:text-white hover:bg-zinc-800/30 transition-all duration-300"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <RiHistoryLine className="text-xl" />
                            <span className="font-medium">History</span>
                        </Link>

                        {isAuthenticated ? (
                            <Link
                                href="/trakt"
                                className="flex items-center gap-2 px-4 py-3 text-zinc-300 hover:text-white hover:bg-zinc-800/30 transition-all duration-300"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <SiTrakt className="text-xl" />
                                <span className="font-medium">Trakt Account</span>
                            </Link>
                        ) : (
                            <button 
                                onClick={() => {
                                    login();
                                    setIsMenuOpen(false);
                                }}
                                className="flex items-center gap-2 px-4 py-3 w-full text-left text-zinc-300 hover:text-white hover:bg-zinc-800/30 transition-all duration-300"
                            >
                                <RiLoginCircleLine className="text-xl" />
                                <span className="font-medium">Login With Trakt</span>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}
