// app/redirect/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
      console.log('SESSION:', session);
    if (status === 'loading') return;

    const role = session?.user?.role;
      console.log('USER ROLE:', role);

    if (!role) {
      router.push('/login');
    } else if (role === 'admin') {
      router.push('/admin/dashboard');
    } else if (role === 'doctor') {
      router.push('/doctor/dashboard');
    } else if (role === 'patient') {
      router.push('/patient/dashboard');
    } else {
      router.push('/');
    }
  }, [session, status, router]);

  return <p className="text-center mt-20">Redirecting...</p>;
}
