import React from 'react';
import Link from 'next/link';
import { Search, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-24 h-24 mx-auto rounded-3xl bg-primary/10 text-primary flex items-center justify-center font-black text-3xl border border-primary/20 shadow-inner">
          404
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-text-main">
            الصفحة غير موجودة | Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
            عذراً، الصفحة أو قطعة الغيار التي تبحث عنها قد تم نقلها أو لم تعد متوفرة.
            <br />
            The page or spare part you requested could not be found.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/ar"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-md shadow-primary/20 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>العودة للرئيسية</span>
          </Link>

          <Link
            href="/ar/shop"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-bg-secondary text-text-main text-xs font-bold hover:bg-bg-secondary/80 border border-border-color transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>تصفح قطع الغيار</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
