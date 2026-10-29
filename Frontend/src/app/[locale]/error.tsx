'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log unexpected runtime error to monitoring system
    console.error('Unhandled app runtime error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 border border-rose-200 flex items-center justify-center shadow-inner">
          <AlertTriangle className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-text-main">
            حدث خطأ غير متوقع | Something went wrong
          </h1>
          <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
            نعتذر عن هذا العطل المؤقت. يمكنك محاولة إعادة تحميل الصفحة أو العودة للصفحة الرئيسية.
          </p>
          {error.digest && (
            <p className="text-[10px] font-mono text-text-muted/60">
              Error Digest: {error.digest}
            </p>
          )}
        </div>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-md shadow-primary/20 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة المحاولة | Retry</span>
          </button>

          <Link
            href="/ar"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-bg-secondary text-text-main text-xs font-bold hover:bg-bg-secondary/80 border border-border-color transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>الرئيسية | Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
