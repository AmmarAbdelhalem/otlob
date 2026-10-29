import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/api/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const couponsOnly = searchParams.get('coupons_only') === 'true';

  try {
    const backendUrl = new URL(`${API_BASE_URL}/offers`);
    if (couponsOnly) {
      backendUrl.searchParams.set('coupons_only', 'true');
    }

    const backendRes = await fetch(backendUrl.toString(), {
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (backendRes.ok) {
      const data = await backendRes.json();
      return NextResponse.json(data);
    }
  } catch {
    // If backend unreachable, return empty real array
  }

  // All mock data deleted. Returns empty active offers array.
  return NextResponse.json({
    success: true,
    data: [],
  });
}
