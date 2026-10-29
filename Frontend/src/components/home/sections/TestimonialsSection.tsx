'use client';

import React from 'react';
import { Star, MessageSquareQuote, CheckCircle } from 'lucide-react';
import { Locale } from '@/lib/api/types';

interface TestimonialsProps {
  locale: Locale;
}

export const TestimonialsSection: React.FC<TestimonialsProps> = ({ locale }) => {
  const reviews = [
    {
      id: 'rev-1',
      name: 'م. طارق عبد الرحمن',
      car: 'تويوتا كورولا 2021',
      text: 'طلبت تيل فرامل وبوجيهات إيريديوم وصلوا خلال 3 ساعات بالظبط وتابعت الكابتن على الخريطة لحظة بلحظة لحد ما وصل لعنوان الورشة. والقطع أصلية ومطابقة 100%.',
      rating: 5,
    },
    {
      id: 'rev-2',
      name: 'أحمد نبيل مصطفى',
      car: 'هيونداي إلنترا HD',
      text: 'ميزة البحث برقم الشاسيه (VIN) سهلت عليا جداً اختيار القطع المناسبة لسيارتي بدون ما أقلق تطلع مش راكبة. خدمة عملاء وسرعة استجابة ممتازة.',
      rating: 5,
    },
    {
      id: 'rev-3',
      name: 'كريم صبحي إبراهيم',
      car: 'نيسان صني N17',
      text: 'اشتريت طقم مساعدين كايابا ومقصات أصلية، السعر كان أقل من السوق بحوالي 400 جنيه والدفع كاش عند الاستلام بعد المعاينة والفحص. شكراً فريق اطلب.',
      rating: 5,
    },
  ];

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 border-b border-surface-border pb-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <MessageSquareQuote className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-text">
            {locale === 'ar' ? 'آراء وتجارب عملاء اطلب' : 'Customer Reviews & Feedback'}
          </h3>
          <p className="text-xs text-text-muted">
            {locale === 'ar' ? 'أكثر من 10,000 عميل يثقون في منصة اطلب لقطع الغيار' : 'Over 10,000 drivers trust Otlob in Egypt'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="p-5 rounded-2xl bg-surface border border-surface-border shadow-xs flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-accent">
                {[...Array(rev.rating)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-text leading-relaxed italic">
                &ldquo;{rev.text}&rdquo;
              </p>
            </div>

            <div className="pt-3 border-t border-surface-border flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-text block">{rev.name}</span>
                <span className="text-[11px] text-text-muted block">{rev.car}</span>
              </div>
              <span className="text-success text-[10px] font-bold flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                <span>مشتري موثق</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
