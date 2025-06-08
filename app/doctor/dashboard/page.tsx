'use client';

import DoctorSidebar from '@/components/Sidebar/DoctorSidebar';
import Footer from '@/components/Footer';
import { useSession } from 'next-auth/react';

export default function DoctorDashboard() {
  const { data: session } = useSession();

  return (
    <div className="flex min-h-screen">
      <DoctorSidebar />

      <main className="flex-1 p-8 flex flex-col">
        <h1 className="text-3xl font-bold mb-4">Doctor Dashboard</h1>
        <p>Welcome, Dr. {session?.user?.email}</p>
        <p>Your role is: {session?.user?.role}</p>

        <div className="mt-auto">
          <Footer />
        </div>
      </main>
    </div>
  );
}
