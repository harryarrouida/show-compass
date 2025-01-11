import Link from 'next/link';
import { FaTwitter, FaGithub } from 'react-icons/fa';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-auto border-t border-zinc-800/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* About Section */}
                    <div className="space-y-4">
                        <h3 className="text-zinc-100 font-medium">About</h3>
                        <p className="text-sm text-zinc-400 leading-relaxed">
                            Discover your next favorite story with personalized recommendations powered by AI.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h3 className="text-zinc-100 font-medium">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-300 transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-sm text-zinc-400 hover:text-zinc-300 transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-sm text-zinc-400 hover:text-zinc-300 transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div className="space-y-4">
                        <h3 className="text-zinc-100 font-medium">Resources</h3>
                        <ul className="space-y-2">
                            <li>
                                <a 
                                    href="https://www.themoviedb.org/" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
                                >
                                    TMDB
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="space-y-4">
                        <h3 className="text-zinc-100 font-medium">Connect</h3>
                        <div className="flex space-x-4">
                            <a 
                                href="https://x.com/harryarrouida" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-zinc-400 hover:text-zinc-300 transition-colors"
                                aria-label="Twitter"
                            >
                                <FaTwitter className="w-5 h-5" />
                            </a>
                            <a 
                                href="https://github.com/harryarrouida/show-compass" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-zinc-400 hover:text-zinc-300 transition-colors"
                                aria-label="GitHub"
                            >
                                <FaGithub className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-12 pt-8 border-t border-zinc-800/50">
                    <p className="text-center text-sm text-zinc-400">
                        © {currentYear} Show Compass. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
} 