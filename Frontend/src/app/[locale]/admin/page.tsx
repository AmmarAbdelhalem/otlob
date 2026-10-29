import { redirect } from 'next/navigation';

export default function AdminRedirectPage() {
  const backendAdminUrl = process.env.NEXT_PUBLIC_BACKEND_URL 
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin`
    : 'http://localhost:8000/admin';

  redirect(backendAdminUrl);
}
