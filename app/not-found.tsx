"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { IoCompassOutline } from "react-icons/io5";
import PageLayout from "@/components/layout/PageLayout";

export default function NotFound() {
  const router = useRouter();
  return (
    <PageLayout>
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="surface-panel w-full max-w-lg px-6 py-14 text-center sm:px-12">
          <IoCompassOutline aria-hidden="true" className="mx-auto mb-5 size-10 text-accent-primary" />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-hover">404 — Lost your way?</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-text-primary">Page not found</h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-text-secondary">
            This page may have moved or no longer exists. There are plenty of titles still to discover.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/" className="secondary-action bg-accent-primary/15 text-accent-hover">Explore titles</Link>
            <button type="button" onClick={() => router.back()} className="secondary-action">Go back</button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
