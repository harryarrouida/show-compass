"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RiBookmarkLine, RiCompass3Line, RiLoginCircleLine } from "react-icons/ri";
import { SiTrakt } from "react-icons/si";
import { useTraktContext } from "@/contexts/traktContext";

export default function Navbar() {
  const { isAuthenticated, login } = useTraktContext();
  const pathname = usePathname();
  const linkClass = "inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-text-secondary hover:bg-background-tertiary hover:text-text-primary aria-[current=page]:bg-background-tertiary aria-[current=page]:text-accent-hover sm:px-3";

  return (
    <nav aria-label="Main navigation" className="sticky top-0 z-40 border-b border-border-primary bg-background-primary/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-x-2 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-current={pathname === "/" ? "page" : undefined} className="inline-flex min-h-11 items-center gap-2 rounded-lg text-base font-bold text-text-primary">
          <RiCompass3Line aria-hidden="true" className="size-5 text-accent-primary" />
          Show Compass
        </Link>

        <div className="flex items-center gap-1">
          <Link href="/history" aria-current={pathname === "/history" ? "page" : undefined} className={linkClass}>
            <RiBookmarkLine aria-hidden="true" />
            Saved
          </Link>
          {isAuthenticated ? (
            <Link href="/trakt" aria-current={pathname === "/trakt" ? "page" : undefined} className={linkClass}>
              <SiTrakt aria-hidden="true" />
              Trakt
            </Link>
          ) : (
            <button type="button" onClick={login} className={linkClass}>
              <RiLoginCircleLine aria-hidden="true" />
              Connect Trakt
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
