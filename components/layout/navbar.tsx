'use client';

import Link from 'next/link';
import { useState } from 'react';
import { RiBookmarkLine, RiLoginCircleLine, RiMenuLine, RiCloseLine } from "react-icons/ri";
import { SiTrakt } from 'react-icons/si';
import { useTraktContext } from '@/contexts/traktContext';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const { isAuthenticated, login } = useTraktContext();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    return (
        <nav className="sticky top-0 z-50 bg-background-secondary border-b border-border-primary">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center h-16 justify-between">
                    {/* Logo */}
                    <Link href="/" className="text-xl font-bold text-white">
                        Show Compass
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden sm:flex items-center gap-4">
                        <Link
                            href="/history"
                            className={`flex items-center gap-2 px-3 py-2 transition-colors hover:text-blue-400 ${pathname === '/history' ? 'text-blue-400 underline-offset-2 underline' : 'text-text-secondary'}`}
                        >
                            <RiBookmarkLine />
                            <span>Saved</span>
                        </Link>

                        {isAuthenticated ? (
                            <Link 
                                href="/trakt"
                                className={`flex items-center gap-2 px-3 py-2 transition-colors hover:text-blue-400 ${pathname === '/trakt' ? 'text-blue-400 underline-offset-2 underline' : 'text-text-secondary'}`}
                            >
                                <SiTrakt />
                                <span>Trakt</span>
                            </Link>
                        ) : (
                            <button 
                                onClick={login}
                                className="flex items-center gap-2 px-3 py-2 text-text-secondary"
                            >
                                <RiLoginCircleLine />
                                <span>Login</span>
                            </button>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="sm:hidden p-2 text-text-secondary"
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <RiCloseLine /> : <RiMenuLine />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="sm:hidden py-2 border-t">
                        <Link
                            href="/history"
                            className={`flex items-center gap-2 px-3 py-2 ${pathname === '/history' ? 'text-blue-500' : 'text-text-secondary'}`}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <RiBookmarkLine />
                            <span>Saved</span>
                        </Link>

                        {isAuthenticated ? (
                            <Link
                                href="/trakt"
                                className={`flex items-center gap-2 px-3 py-2 ${pathname === '/trakt' ? 'text-blue-500' : 'text-text-secondary'}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <SiTrakt />
                                <span>Trakt</span>
                            </Link>
                        ) : (
                            <button 
                                onClick={() => {
                                    login();
                                    setIsMenuOpen(false);
                                }}
                                className="flex items-center gap-2 px-3 py-2 w-full text-text-secondary"
                            >
                                <RiLoginCircleLine />
                                <span>Login</span>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}
