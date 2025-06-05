'use client';

import { useSession } from 'next-auth/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function About() {
  const { data: session, status } = useSession();

  if (status === 'loading')
    return <p className="text-center mt-10 text-gray-800">Loading...</p>;

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto p-6 mt-10 bg-white rounded shadow min-h-[60vh]">
        {session ? (
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4 text-red-600">Access Restricted</h2>
            <p className="text-gray-800">
              You are logged in. This page is only for visitors.
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-4xl font-bold mb-6 text-center text-gray-900">About Us</h1>
            <p className="mb-4 text-lg leading-relaxed text-gray-800">
              Welcome to our Hospital Management System. We aim to provide seamless access to hospital and patient
              information with an easy-to-use interface for doctors, patients, and administrators.
            </p>
            <p className="text-lg leading-relaxed text-gray-800">
              Our platform enhances communication and streamlines healthcare workflows to improve patient outcomes.
            </p>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
