'use client';

import React from 'react';

export default function RootNotFound() {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <title>404 - الصفحة غير موجودة | Otlob Parts</title>
      </head>
      <body style={{ margin: 0, padding: 0, background: '#F8FAFC', color: '#0F172A', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div
          style={{
            display: 'flex',
            minHeight: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            padding: '1.5rem',
            textAlign: 'center',
          }}
        >
          <h1 style={{ fontSize: '3rem', fontWeight: 900, color: '#2563EB', margin: 0 }}>404</h1>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0' }}>الصفحة غير موجودة</h2>
          <p style={{ color: '#64748B', maxWidth: 400, margin: '0 0 1.5rem 0' }}>
            عذراً، الصفحة التي تبحث عنها غير متوفرة أو قد تم نقلها.
          </p>
          <a
            href="/ar"
            style={{
              background: '#2563EB',
              color: '#FFFFFF',
              padding: '0.625rem 1.25rem',
              borderRadius: '0.5rem',
              fontWeight: 700,
              textDecoration: 'none',
              fontSize: '0.875rem',
            }}
          >
            العودة إلى الصفحة الرئيسية
          </a>
        </div>
      </body>
    </html>
  );
}
