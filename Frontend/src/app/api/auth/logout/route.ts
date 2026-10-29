import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/api/client';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('otlob_token')?.value;

  if (process.env.NEXT_PUBLIC_API_MODE !== 'mock' && token) {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      // Ignore network errors on logout
    }
  }

  const res = NextResponse.json({
    success: true,
    message: 'Logged out successfully.',
    data: null,
  });

  res.cookies.delete('otlob_token');
  res.cookies.delete('otlob_user');

  return res;
}
