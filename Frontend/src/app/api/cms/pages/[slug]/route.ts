import { NextRequest } from 'next/server';
import { fetchBackendJson } from '@/lib/api/backendProxy';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  return fetchBackendJson(`/cms/pages/${slug}`, 300);
}
