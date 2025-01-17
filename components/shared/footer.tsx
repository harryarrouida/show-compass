import Link from "next/link";
import { FaTwitter, FaGithub } from "react-icons/fa";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-zinc-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-zinc-100 font-semibold text-lg">
              Show Compass
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">
              Your AI-powered entertainment companion. Discover personalized
              movie and TV show recommendations tailored just for you.
            </p>
            <div className="flex space-x-4 pt-4">
              <a
                href="https://github.com/harryarrouida"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-zinc-300 transition-colors"
                aria-label="GitHub"
              >
                <FaGithub className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-zinc-100 font-semibold">Navigation</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/"
                    className="text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
                  >
                    Home
                  </Link>
                </li>
                {/* <li>
                  <Link
                    href="/movies"
                    className="text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
                  >
                    Movies
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shows"
                    className="text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
                  >
                    TV Shows
                  </Link>
                </li> */}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-zinc-100 font-semibold">Legal</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/privacy"
                    className="text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li className="flex items-center gap-2">
                  <img
                    src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_1-5bdc75aaebeb75dc7ae79426ddd9be3b2be1e342510f8202baf6bffa71d7f5c4.svg"
                    alt="TMDB"
                    className="w-4 h-4"
                  />
                  <a
                    href="https://www.themoviedb.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
                  >
                    TMDB Attribution
                  </a>
                </li>
              </ul>
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
