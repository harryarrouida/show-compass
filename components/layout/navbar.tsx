'use client';

import Link from 'next/link';
import { useState } from 'react';
import { RiBookmarkLine, RiLoginCircleLine, RiMenuLine, RiCloseLine, RiMailLine, RiLock2Line, RiGoogleFill, RiUser3Line, RiProfileFill} from "react-icons/ri";
import { SiTrakt } from 'react-icons/si';
import { useTraktContext } from '@/contexts/traktContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';

function AuthModal({ open, onClose }: { open: boolean, onClose: () => void }) {
    const { login, signup, googleSignIn } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await signup(email, password);
            }
            onClose();
        } catch (err: any) {
            setError(err?.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        setError(null);
        setLoading(true);
        try {
            await googleSignIn();
            onClose();
        } catch (err: any) {
            setError(err?.message || 'Google sign-in failed');
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80">
            <div className="bg-background-secondary rounded-lg shadow-lg w-full max-w-sm p-6 relative">
                <button
                    className="absolute top-3 right-3 text-text-secondary hover:text-white"
                    onClick={onClose}
                    aria-label="Close"
                >
                    <RiCloseLine size={22} />
                </button>
                <div className="flex flex-col items-center mb-4">
                    <RiUser3Line className="text-blue-400 mb-2" size={32} />
                    <h2 className="text-xl font-semibold text-white mb-1">{isLogin ? 'Login' : 'Sign Up'}</h2>
                    <p className="text-sm text-text-secondary">{isLogin ? 'Sign in to your account' : 'Create a new account'}</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex items-center border border-border-primary rounded px-3 py-2 bg-background-primary">
                        <RiMailLine className="text-text-secondary mr-2" />
                        <input
                            type="email"
                            placeholder="Email"
                            className="bg-transparent outline-none flex-1 text-white"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>
                    <div className="flex items-center border border-border-primary rounded px-3 py-2 bg-background-primary">
                        <RiLock2Line className="text-text-secondary mr-2" />
                        <input
                            type="password"
                            placeholder="Password"
                            className="bg-transparent outline-none flex-1 text-white"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            autoComplete={isLogin ? "current-password" : "new-password"}
                        />
                    </div>
                    {error && <div className="text-red-500 text-sm">{error}</div>}
                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors disabled:opacity-60"
                        disabled={loading}
                    >
                        {isLogin ? <RiLoginCircleLine /> : <RiUser3Line />}
                        {isLogin ? 'Login' : 'Sign Up'}
                    </button>
                </form>
                <div className="my-4 flex items-center gap-2">
                    <div className="flex-1 h-px bg-border-primary" />
                    <span className="text-xs text-text-secondary">or</span>
                    <div className="flex-1 h-px bg-border-primary" />
                </div>
                <button
                    onClick={handleGoogle}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded bg-white text-black font-semibold hover:bg-gray-200 transition-colors disabled:opacity-60"
                    disabled={loading}
                    type="button"
                >
                    <RiGoogleFill className="text-red-500" />
                    Continue with Google
                </button>
                <div className="mt-4 text-center">
                    <button
                        type="button"
                        className="text-blue-400 hover:underline text-sm"
                        onClick={() => setIsLogin(!isLogin)}
                        disabled={loading}
                    >
                        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Navbar() {
    const { isAuthenticated: isTraktAuthenticated, login: traktLogin } = useTraktContext();
    const { currentUser } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const pathname = usePathname();

    // If user is logged in via account, show trakt/saved, else show login modal button
    const isAccountConnected = !!currentUser;

    return (
        <>
            <nav className="sticky top-0 z-50 bg-background-secondary border-b border-border-primary">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center h-16 justify-between">
                        {/* Logo */}
                        <Link href="/" className="text-xl font-bold text-white">
                            Show Compass
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden sm:flex items-center gap-4">
                            {isAccountConnected ? (
                                <>
                                    <Link
                                        href="/history"
                                        className={`flex items-center gap-2 px-3 py-2 transition-colors hover:text-blue-400 ${pathname === '/history' ? 'text-blue-400 underline-offset-2 underline' : 'text-text-secondary'}`}
                                    >
                                        <RiBookmarkLine />
                                        <span>Saved</span>
                                    </Link>
                                    <Link
                                        href="/trakt"
                                        className={`flex items-center gap-2 px-3 py-2 transition-colors hover:text-blue-400 ${pathname === '/trakt' ? 'text-blue-400 underline-offset-2 underline' : 'text-text-secondary'}`}
                                    >
                                        <SiTrakt />
                                        <span>Trakt</span>
                                    </Link>
                                    <Link
                                        href="/profile"
                                        className={`flex items-center gap-2 px-3 py-2 transition-colors hover:text-blue-400 ${pathname === '/profile' ? 'text-blue-400 underline-offset-2 underline' : 'text-text-secondary'}`}
                                    >
                                        <RiUser3Line />
                                        <span>Profile</span>
                                    </Link>
                                </>
                            ) : (
                                <button
                                    onClick={() => setAuthModalOpen(true)}
                                    className="flex items-center gap-2 px-3 py-2 text-text-secondary hover:text-blue-400 transition-colors"
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
                            {isAccountConnected ? (
                                <>
                                    <Link
                                        href="/history"
                                        className={`flex items-center gap-2 px-3 py-2 ${pathname === '/history' ? 'text-blue-500' : 'text-text-secondary'}`}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <RiBookmarkLine />
                                        <span>Saved</span>
                                    </Link>
                                    <Link
                                        href="/trakt"
                                        className={`flex items-center gap-2 px-3 py-2 ${pathname === '/trakt' ? 'text-blue-500' : 'text-text-secondary'}`}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <SiTrakt />
                                        <span>Trakt</span>
                                    </Link>
                                </>
                            ) : (
                                <button
                                    onClick={() => {
                                        setAuthModalOpen(true);
                                        setIsMenuOpen(false);
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 w-full text-text-secondary hover:text-blue-400 transition-colors"
                                >
                                    <RiLoginCircleLine />
                                    <span>Login</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </nav>
            <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
        </>
    );
}
