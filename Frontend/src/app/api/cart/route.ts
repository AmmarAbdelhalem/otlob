import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_BASE_URL } from '@/lib/api/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('otlob_token')?.value;

  if (!token) {
    return NextResponse.json({
      success: true,
      data: null,
      message: 'Guest session',
    });
  }

  try {
    const res = await fetch(`${API_BASE_URL}/customer/cart`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Cart GET Proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch cart from server' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  const token = cookieStore.get('otlob_token')?.value;

  if (!token) {
    return NextResponse.json({ success: true, message: 'Guest cart cleared locally' });
  }

  try {
    const res = await fetch(`${API_BASE_URL}/customer/cart`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Cart DELETE Proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to clear cart on server' },
      { status: 500 }
    );
  }
}
