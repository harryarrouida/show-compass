'use client';

import Link from 'next/link';
import { useState } from 'react';
import { RiBookmarkLine, RiLoginCircleLine, RiMenuLine, RiCloseLine } from "react-icons/ri";
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
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-violet-400 transition-colors duration-300 hover:text-violet-300">
                            Show Compass
                        </h1>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden sm:flex items-center gap-4">
                        <Link
                            href="/history"
                            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-lg transition-colors duration-300 font-medium
                                     ${pathname === '/history' 
                                        ? 'bg-zinc-800 text-white' 
                                        : 'text-zinc-300 hover:text-white hover:bg-zinc-800'}`}
                        >
                            <RiBookmarkLine className="text-xl" />
                            <span>Saved</span>
                        </Link>

                        {isAuthenticated ? (
                            <Link 
                                href="/trakt"
                                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-lg transition-colors duration-300 font-medium
                                         ${pathname === '/trakt'
                                            ? 'bg-violet-500/20 text-violet-300'
                                            : 'bg-violet-500/10 text-violet-300 hover:bg-violet-500/20'}`}
                            >
                                <SiTrakt className="text-xl" />
                                <span>Trakt Account</span>
                            </Link>
                        ) : (
                            <button 
                                onClick={login}
                                className="flex items-center gap-2.5 px-5 py-2.5 rounded-lg font-medium
                                         bg-violet-600 text-white transition-colors duration-300 
                                         hover:bg-violet-500"
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
                                 hover:bg-zinc-800 rounded-lg transition-colors duration-300"
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
                    <div className="sm:hidden py-3 border-t border-zinc-800 space-y-2">
                        <Link
                            href="/history"
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-lg transition-colors duration-300
                                     ${pathname === '/history'
                                        ? 'bg-zinc-800 text-white'
                                        : 'text-zinc-300 hover:text-white hover:bg-zinc-800'}`}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <RiBookmarkLine className="text-xl" />
                            <span className="font-medium">Saved</span>
                        </Link>

                        {isAuthenticated ? (
                            <Link
                                href="/trakt"
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-lg transition-colors duration-300
                                         ${pathname === '/trakt'
                                            ? 'bg-violet-500/20 text-violet-300'
                                            : 'bg-violet-500/10 text-violet-300 hover:bg-violet-500/20'}`}
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
                                className="flex items-center gap-3 px-4 py-3.5 w-full rounded-lg
                                         bg-violet-600 text-white transition-colors duration-300
                                         hover:bg-violet-500 font-medium"
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
