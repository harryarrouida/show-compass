'use client';

import { IoWarning } from 'react-icons/io5';
import { useRouter } from 'next/navigation';
import PageLayout from '@/components/layout/PageLayout';

export default function NotFound() {
  const router = useRouter();

  return (
    <PageLayout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-6 p-8 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
          <IoWarning className="w-12 h-12 text-amber-400 mx-auto" />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-zinc-100">Page Not Found</h2>
            <p className="text-sm text-zinc-400">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
          <div className="space-y-4">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center px-6 py-3 bg-zinc-800 rounded-lg text-sm hover:bg-zinc-700 transition-colors w-full"
            >
              Go Back
            </button>
            <button
              onClick={() => router.push('/')}
              className="text-sm text-zinc-500 hover:text-zinc-400 transition-colors"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
