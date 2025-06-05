'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', surname: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsSuccess(false);

    if (!form.name || !form.surname || !form.email || !form.password) {
      setMessage('Please fill out all fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const responseBody = await res.text();
      let data;

      try {
        data = JSON.parse(responseBody);
      } catch (e) {
        console.error('Failed to parse response:', responseBody);
        setMessage('Invalid server response');
        return;
      }

      if (!res.ok) {
        setMessage(data.message || 'Registration failed');
        return;
      }

      setIsSuccess(true);
      setMessage('Registration successful!');
      setForm({ name: '', surname: '', email: '', password: '' });
    } catch (error: any) {
      console.error('Fetch error:', error);
      setMessage(error.message || 'Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />

      <main className="max-w-md mx-auto mt-10 p-6 border rounded shadow-sm">
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>

        <form onSubmit={handleSubmit} className="space-y-4" aria-describedby="form-message">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="First Name"
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="text"
            name="surname"
            value={form.surname}
            onChange={handleChange}
            placeholder="Last Name"
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full border px-3 py-2 rounded"
          />

          <button
            type="submit"
            className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="my-6 text-center">
          <p className="mb-2 text-gray-600">Or register with</p>
          <button
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded w-full"
          >
            Continue with Google
          </button>
        </div>

        {message && (
          <p
            id="form-message"
            className={`mt-4 text-sm text-center font-medium ${
              isSuccess ? 'text-green-600' : 'text-red-600'
            }`}
            role="alert"
          >
            {message}
          </p>
        )}
      </main>

      <Footer />
    </>
  );
}
