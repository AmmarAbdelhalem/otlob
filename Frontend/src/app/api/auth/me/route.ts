import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/api/client';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('otlob_token')?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, message: 'Unauthenticated' },
      { status: 401 }
    );
  }

  if (process.env.NEXT_PUBLIC_API_MODE === 'mock') {
    return NextResponse.json({
      success: true,
      data: {
        id: 'usr-mock-1',
        name: 'أحمد محمد',
        phone: '01012345678',
        email: 'ahmed@example.com',
        role: 'customer',
        status: 'active',
        vehicles: [
          {
            id: 'veh-sample-1',
            make: 'Toyota',
            model: 'Corolla',
            year: 2020,
            vin: 'JTDBR32E123456789',
            isDefault: true,
          },
        ],
      },
    });
  }

  try {
    const backendRes = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching user' },
      { status: 500 }
    );
  }
}
