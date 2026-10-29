import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/api/client';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('otlob_token')?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'يجب تسجيل الدخول أولاً لتأكيد طلب الشراء.',
        },
        { status: 401 }
      );
    }

    const payload = await req.json();

    const backendRes = await fetch(`${API_BASE_URL}/orders/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await backendRes.json();

    return NextResponse.json(data, { status: backendRes.status });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'خطأ في معالجة طلب الشراء' },
      { status: 500 }
    );
  }
}
