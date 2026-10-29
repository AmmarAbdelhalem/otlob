import { fetchBackendJson } from '@/lib/api/backendProxy';

export async function GET() {
  return fetchBackendJson('/cms/banners', 60, { success: true, data: [] });
}
