'use client';

import { useSession } from 'next-auth/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminSidebar from '@/components/Sidebar/AdminSidebar';

export default function AdminDashboard() {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />

      <div className="flex flex-1">
        <AdminSidebar />

        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
          <p>Welcome, {session?.user?.email}</p>
          <p>Your role is: {session?.user?.role}</p>
        </main>
      </div>

      <Footer />
    </div>
  );
}
