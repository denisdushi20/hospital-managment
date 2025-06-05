'use client';

import { useSession } from 'next-auth/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TermsPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') return <p className="text-center mt-10">Loading...</p>;

  if (session) {
    return (
      <>
        <Header />
        <main className="max-w-4xl mx-auto p-6 mt-10 bg-white rounded shadow text-center">
          <h2 className="text-2xl font-semibold mb-4">Access Restricted</h2>
          <p>You are logged in. This page is only for visitors.</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto p-6 mt-10 bg-white rounded shadow text-gray-800">
        <h1 className="text-4xl font-bold mb-6 text-center">Terms and Conditions</h1>
        <p className="mb-4 text-lg leading-relaxed">
          By accessing or using our Hospital Management System, you agree to comply with and be bound by the following
          terms and conditions. Please read them carefully.
        </p>
        <p className="mb-4 text-lg leading-relaxed">
          You are responsible for maintaining the confidentiality of your login credentials and for all activities that
          occur under your account.
        </p>
        <p className="mb-4 text-lg leading-relaxed">
          Unauthorized use of this system is strictly prohibited. We reserve the right to terminate or restrict access
          to users who violate these terms.
        </p>
        <p className="text-lg leading-relaxed">
          These terms may be updated from time to time. Continued use of the system after such changes will constitute
          acceptance of the new terms.
        </p>
      </main>
      <Footer />
    </>
  );
}
