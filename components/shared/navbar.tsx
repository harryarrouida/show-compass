'use client';

import Link from 'next/link';
import { useState } from 'react';
import { RiHistoryLine, RiLoginCircleLine, RiMenuLine, RiBookmarkLine, RiCloseLine } from "react-icons/ri";
import { SiTrakt } from 'react-icons/si';
import { useTraktContext } from '@/context/traktContext';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const { isAuthenticated, login } = useTraktContext();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    return (
        <nav className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-2xl border-b border-zinc-800/50 shadow-2xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center h-20 justify-between">
                    {/* Logo */}
                    <Link href="/" className="group">
                        <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-white via-violet-400 to-white 
                                     bg-clip-text text-transparent transition-all duration-500 
                                     group-hover:via-violet-500 group-hover:scale-[1.02]">
                            Show Compass
                        </h1>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden sm:flex items-center gap-4">
                        <Link
                            href="/history"
                            className={`flex items-center gap-2.5 px-5 py-2.5 
                                     ${pathname === '/history' 
                                        ? 'bg-zinc-800/80 text-white' 
                                        : 'text-zinc-300 hover:text-white hover:bg-zinc-800/50'} 
                                     rounded-xl transition-all duration-300 font-medium`}
                        >
                            <RiBookmarkLine className="text-xl" />
                            <span>Saved</span>
                        </Link>

                        {isAuthenticated ? (
                            <Link 
                                href="/trakt"
                                className={`flex items-center gap-2.5 px-5 py-2.5 
                                         ${pathname === '/trakt'
                                            ? 'bg-violet-500/20 text-violet-200 border border-violet-500/30'
                                            : 'bg-violet-500/10 text-violet-300 border border-violet-500/20 hover:bg-violet-500/20 hover:border-violet-500/30'}
                                         rounded-xl transition-all duration-300 font-medium`}
                            >
                                <SiTrakt className="text-xl" />
                                <span>Trakt Account</span>
                            </Link>
                        ) : (
                            <button 
                                onClick={login}
                                className="flex items-center gap-2.5 px-5 py-2.5
                                         bg-gradient-to-r from-violet-600 to-violet-500
                                         hover:from-violet-500 hover:to-violet-400
                                         text-white rounded-xl transition-all duration-300 
                                         font-medium shadow-lg shadow-violet-500/20
                                         hover:shadow-violet-500/30 hover:scale-[1.02]"
                            >
                                <RiLoginCircleLine className="text-xl" />
                                <span>Login With Trakt</span>
                            </button>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="sm:hidden p-2.5 text-zinc-300 hover:text-white 
                                 hover:bg-zinc-800/50 rounded-xl transition-all duration-300"
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? (
                            <RiCloseLine className="text-2xl" />
                        ) : (
                            <RiMenuLine className="text-2xl" />
                        )}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="sm:hidden py-3 border-t border-zinc-800/50 space-y-1">
                        <Link
                            href="/history"
                            className={`flex items-center gap-3 px-4 py-3.5 
                                     ${pathname === '/history'
                                        ? 'bg-zinc-800/80 text-white'
                                        : 'text-zinc-300 hover:text-white hover:bg-zinc-800/30'}
                                     rounded-xl transition-all duration-300`}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <RiBookmarkLine className="text-xl" />
                            <span className="font-medium">History</span>
                        </Link>

                        {isAuthenticated ? (
                            <Link
                                href="/trakt"
                                className={`flex items-center gap-3 px-4 py-3.5
                                         ${pathname === '/trakt'
                                            ? 'bg-violet-500/20 text-violet-200'
                                            : 'bg-violet-500/10 text-violet-300 hover:bg-violet-500/20'}
                                         rounded-xl transition-all duration-300`}
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
                                className="flex items-center gap-3 px-4 py-3.5 w-full text-left
                                         bg-gradient-to-r from-violet-600 to-violet-500
                                         hover:from-violet-500 hover:to-violet-400 
                                         text-white rounded-xl transition-all duration-300
                                         font-medium shadow-lg shadow-violet-500/20"
                            >
                                <RiLoginCircleLine className="text-xl" />
                                <span>Login With Trakt</span>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}
