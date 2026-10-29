import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/api/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userLocale = req.headers.get('x-locale') || req.headers.get('accept-language') || 'ar';

    try {
      const backendRes = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Locale': userLocale,
        },
        body: JSON.stringify(body),
      });

      const data = await backendRes.json();

      if (!backendRes.ok || !data.success) {
        // Extract the first human-readable validation error
        let errorMsg = data.message;
        if (data.errors && typeof data.errors === 'object') {
          const firstKey = Object.keys(data.errors)[0];
          if (firstKey && Array.isArray(data.errors[firstKey]) && data.errors[firstKey].length > 0) {
            errorMsg = data.errors[firstKey][0];
          }
        }

        return NextResponse.json(
          {
            success: false,
            message: errorMsg || (userLocale === 'ar' ? 'فشل التسجيل، يرجى التحقق من البيانات المدخلة' : 'Registration failed'),
            errors: data.errors,
          },
          { status: backendRes.status }
        );
      }

      const { user, token } = data.data;
      const res = NextResponse.json(data, { status: 201 });

      // HttpOnly secure token cookie
      res.cookies.set('otlob_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      });

      // User session cookie for instant SSR hydration
      res.cookies.set(
        'otlob_user',
        JSON.stringify({
          id: user.id,
          name: user.name,
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

      return res;
    } catch (backendError: any) {
      if (process.env.NEXT_PUBLIC_API_MODE === 'mock') {
        const mockToken = 'mock-sanctum-token-new-user-456';
        const mockUser = {
          id: `usr-${Date.now()}`,
          name: body.name,
          phone: body.phone,
          email: body.email,
          role: body.role || 'customer',
          status: body.role === 'customer' ? 'active' : 'pending',
        };

        const res = NextResponse.json(
          {
            success: true,
            message: 'Registration successful',
            data: { user: mockUser, token: mockToken },
          },
          { status: 201 }
        );

        res.cookies.set('otlob_token', mockToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 30,
        });

        res.cookies.set('otlob_user', JSON.stringify(mockUser), {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 30,
        });

        return res;
      }

      throw backendError;
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Registration gateway error' },
      { status: 500 }
    );
  }
}
