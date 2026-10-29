import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/api/client';

export async function proxyToBackend(
  req: NextRequest,
  backendPath: string,
  options: {
    method?: string;
    body?: any;
    searchParams?: URLSearchParams;
  } = {}
) {
  const token = req.cookies.get('otlob_token')?.value;

  const url = new URL(`${API_BASE_URL}${backendPath.startsWith('/') ? '' : '/'}${backendPath}`);
  if (options.searchParams) {
    options.searchParams.forEach((val, key) => {
      url.searchParams.set(key, val);
    });
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fetchOptions: RequestInit = {
    method: options.method || req.method || 'GET',
    headers,
  };

  if (options.body) {
    headers['Content-Type'] = 'application/json';
    fetchOptions.body = JSON.stringify(options.body);
  } else if (req.method !== 'GET' && req.method !== 'HEAD') {
    try {
      const parsedBody = await req.json();
      headers['Content-Type'] = 'application/json';
      fetchOptions.body = JSON.stringify(parsedBody);
    } catch {
      // Body may be empty
    }
  }

  try {
    const res = await fetch(url.toString(), fetchOptions);
    const data = await res.json().catch(() => null);

    return NextResponse.json(data || { success: res.ok }, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Backend connection error' },
      { status: 502 }
    );
  }
}

/**
 * Fetch public JSON endpoints from Laravel API with cache revalidation and fallback data.
 */
export async function fetchBackendJson<T = any>(
  endpoint: string,
  revalidateSeconds: number = 60,
  fallbackData: T | null = null
): Promise<NextResponse> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  const url = `${backendUrl}/api/v1${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  try {
    const res = await fetch(url, { next: { revalidate: revalidateSeconds } });
    if (!res.ok) {
      if (fallbackData !== null) {
        return NextResponse.json(fallbackData);
      }
      return NextResponse.json({ success: false, message: 'Resource not found' }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    if (fallbackData !== null) {
      return NextResponse.json(fallbackData);
    }
    return NextResponse.json({ success: false, message: 'Service unavailable' }, { status: 503 });
  }
}
