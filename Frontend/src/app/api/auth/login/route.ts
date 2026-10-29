import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/api/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const login = (body.login || '').trim().toLowerCase();
    const password = body.password || '';

    // If forced to mock mode, only permit the single official Admin
    if (process.env.NEXT_PUBLIC_API_MODE === 'mock') {
      const isAdminMatch =
        (login === 'ammar@otlobparts.com' || login === 'aabdelhalem' || login === 'ammar') &&
        password === '13579wry#Aa';

      if (!isAdminMatch) {
        return NextResponse.json(
          { success: false, message: 'Invalid credentials. User does not exist.' },
          { status: 401 }
        );
      }

      const adminUser = {
        id: '695199c2-c853-458f-a570-fd8559b74002',
        name: 'Ammar Abdelhalem',
        username: 'aabdelhalem',
        email: 'ammar@otlobparts.com',
        phone: '01000000000',
        role: 'admin',
        status: 'active',
      };

      const mockToken = 'sanctum-token-admin-ammar-abdelhalem';
      const res = NextResponse.json({
        success: true,
        message: 'Login successful',
        data: { user: adminUser, token: mockToken },
      });

      res.cookies.set('otlob_token', mockToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      });

      res.cookies.set('otlob_user', JSON.stringify(adminUser), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      });

      return res;
    }

    // Live backend authentication
    const backendRes = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();

    if (!backendRes.ok || !data.success) {
      return NextResponse.json(data, { status: backendRes.status });
    }

    const token = data.data.token;
    const user = data.data.user;
    const res = NextResponse.json(data);

    res.cookies.set('otlob_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    if (user) {
      res.cookies.set(
        'otlob_user',
        JSON.stringify({
          id: user.id,
          name: user.name,
          username: user.username,
          role: user.role,
          status: user.status,
          phone: user.phone,
          email: user.email,
        }),
        {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 30,
        }
      );
    }

    return res;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Authentication error' },
      { status: 500 }
    );
  }
}
