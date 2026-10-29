'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, AlertCircle, Loader2 } from 'lucide-react';

interface CmsPage {
  id: number;
  slug: string;
  title_en: string;
  title_ar: string;
  content_en: string;
  content_ar: string;
  meta_title_en?: string;
  meta_title_ar?: string;
  meta_description_en?: string;
  meta_description_ar?: string;
  is_published: boolean;
  updated_at: string;
}

export default function CmsPageView() {
  const params = useParams();
  const locale = (params?.locale as string) || 'ar';
  const slug = params?.slug as string;
  const isAr = locale === 'ar';

  const [page, setPage] = useState<CmsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/cms/pages/${slug}`)
      .then(async (res) => {
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        const json = await res.json();
        if (json.success && json.data) {
          setPage(json.data);
        } else if (json.slug) {
          // Backend returns the model directly
          setPage(json as CmsPage);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  /* ─── Loading ─── */
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-bg-main">
        <div className="flex flex-col items-center gap-3 text-text-muted">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-sm">{isAr ? 'جارٍ التحميل…' : 'Loading…'}</span>
        </div>
      </main>
    );
  }

  /* ─── 404 ─── */
  if (notFound || !page) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-bg-main px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-text-main">
            {isAr ? 'الصفحة غير موجودة' : 'Page Not Found'}
          </h1>
          <p className="text-sm text-text-muted">
            {isAr
              ? 'هذه الصفحة غير موجودة أو لم تُنشر بعد.'
              : 'This page does not exist or has not been published yet.'}
          </p>
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            {isAr ? 'العودة للرئيسية' : 'Back to Home'}
          </Link>
        </div>
      </main>
    );
  }

  const title = isAr ? page.title_ar : page.title_en;
  const content = isAr ? page.content_ar : page.content_en;
  const lastUpdated = new Date(page.updated_at).toLocaleDateString(
    isAr ? 'ar-EG' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' },
  );

  return (
    <main className="min-h-screen bg-bg-main py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back link */}
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          {isAr ? 'الرئيسية' : 'Home'}
        </Link>

        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <FileText className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest opacity-70">
              {isAr ? 'صفحة رسمية' : 'Official Page'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-text-main">{title}</h1>
          <p className="text-xs text-text-muted">
            {isAr ? `آخر تحديث: ${lastUpdated}` : `Last updated: ${lastUpdated}`}
          </p>
        </div>

        {/* Content — RichEditor HTML output */}
        <article
          className={`
            prose prose-sm sm:prose-base max-w-none
            prose-headings:text-text-main prose-headings:font-bold
            prose-p:text-text-muted prose-p:leading-relaxed
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-strong:text-text-main
            prose-ul:text-text-muted prose-ol:text-text-muted
            prose-li:marker:text-primary
            prose-blockquote:border-primary prose-blockquote:text-text-muted
            bg-surface border border-surface-border rounded-2xl p-6 sm:p-8
            rich-content
          `}
          dir={isAr ? 'rtl' : 'ltr'}
          dangerouslySetInnerHTML={{ __html: content || '' }}
        />
      </div>
    </main>
  );
}

