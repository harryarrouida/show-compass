import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import { SiTrakt } from "react-icons/si";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border-primary bg-background-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* About */}
          <div className="text-center md:text-left">
            <h3 className="text-text-primary font-semibold">Show Compass</h3>
            <p className="text-sm text-text-secondary mt-2 max-w-sm">
              Your AI-powered entertainment companion for personalized recommendations.
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/harryarrouida"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-text-primary transition-colors"
              aria-label="GitHub"
            >
              <FaGithub className="w-5 h-5" />
            </a>

            <div className="flex items-center gap-4">
              <a
                href="https://www.themoviedb.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                <img
                  src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_1-5bdc75aaebeb75dc7ae79426ddd9be3b2be1e342510f8202baf6bffa71d7f5c4.svg"
                  alt="TMDB"
                  className="w-4 h-4"
                />
                TMDB
              </a>

              <a
                href="https://trakt.tv/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                <SiTrakt className="w-4 h-4" />
                Trakt
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-6 border-t border-border-primary">
          <p className="text-center text-sm text-text-tertiary">
            © {currentYear} Show Compass. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
