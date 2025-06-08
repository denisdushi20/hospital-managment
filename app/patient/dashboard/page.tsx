'use client';

import PatientSidebar from '@/components/Sidebar/PatientSidebar';
import Footer from '@/components/Footer';
import { useSession } from 'next-auth/react';

export default function PatientDashboard() {
  const { data: session } = useSession();

  return (
    <div className="flex min-h-screen">
      <PatientSidebar />

      <main className="flex-1 p-8 flex flex-col">
        <h1 className="text-3xl font-bold mb-4">Patient Dashboard</h1>
        <p>Welcome, {session?.user?.email}</p>
        <p>Your role is: {session?.user?.role}</p>

        <div className="mt-auto">
          <Footer />
        </div>
      </main>
    </div>
  );
}
// This code defines a Patient Dashboard page in a Next.js application.