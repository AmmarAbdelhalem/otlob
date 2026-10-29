import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_BASE_URL } from '@/lib/api/client';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('otlob_token')?.value;

  if (!token) {
    return NextResponse.json({ success: true, message: 'Updated locally (guest)' });
  }

  try {
    const body = await req.json();

    const res = await fetch(`${API_BASE_URL}/customer/cart/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Cart item add Proxy error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('otlob_token')?.value;

  if (!token) {
    return NextResponse.json({ success: true, message: 'Removed locally (guest)' });
  }

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('product_id');

  if (!productId) {
    return NextResponse.json({ success: false, message: 'Product ID required' }, { status: 400 });
  }

  try {
    const res = await fetch(`${API_BASE_URL}/customer/cart/${productId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Cart item remove Proxy error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
