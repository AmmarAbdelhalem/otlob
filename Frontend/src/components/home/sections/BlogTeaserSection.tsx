'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Calendar, MessageSquare, ArrowRight } from 'lucide-react';
import { Locale } from '@/lib/api/types';
import { services } from '@/lib/api';
import { resolveLocalized } from '@/lib/i18n';

interface BlogTeaserProps {
  locale: Locale;
}

export const BlogTeaserSection: React.FC<BlogTeaserProps> = ({ locale }) => {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    services.content.getBlogTeasers().then(setPosts);
  }, []);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b border-surface-border pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text">
              {locale === 'ar' ? 'مقالات ونصائح صيانة السيارات' : 'Auto Maintenance & Tips'}
            </h3>
            <p className="text-xs text-text-muted">
              {locale === 'ar' ? 'دليلك الشامل للحفاظ على محرك وعفشة سيارتك' : 'Your comprehensive guide to vehicle health and longevity'}
            </p>
          </div>
        </div>

        <Link
          href={`/${locale}/blog`}
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          <span>{locale === 'ar' ? 'عرض المدونة' : 'Read Blog'}</span>
          <ArrowRight className="w-3.5 h-3.5 rtl-mirror" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map((post) => (
          <div
            key={post.id}
            className="p-5 rounded-2xl bg-surface border border-surface-border hover:shadow-lg transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-[11px] text-text-muted">
                <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                  {resolveLocalized(post.category, locale)}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{post.date}</span>
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  <span>{post.commentsCount} {locale === 'ar' ? 'تعليق' : 'comments'}</span>
                </span>
              </div>

              <h4 className="text-base font-bold text-text group-hover:text-primary transition-colors leading-snug">
                {resolveLocalized(post.title, locale)}
              </h4>
            </div>

            <div className="pt-3 border-t border-surface-border flex items-center justify-between text-xs">
              <span className="text-text-muted font-medium">{post.author}</span>
              <Link
                href={`/${locale}/blog/${post.slug}`}
                className="font-bold text-primary hover:underline flex items-center gap-1"
              >
                <span>{locale === 'ar' ? 'اقرأ المقال' : 'Read Article'}</span>
                <ArrowRight className="w-3.5 h-3.5 rtl-mirror" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
