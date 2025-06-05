'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

const publicLinks = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Terms', href: '/terms' },
  { name: 'Login', href: '/login' },
  { name: 'Register', href: '/register' },
];

const userLinks = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Profile', href: '/profile' },
  { name: 'Cart', href: '/cart' },
];

// If admin, add this link (you can add role check later)
const adminLinks = [
  { name: 'Admin Panel', href: '/admin' },
];

export default function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // Check if user is authenticated
  const isAuthenticated = status === 'authenticated';

  // You can get role from session if you add it (for admin check)
  const isAdmin = session?.user?.role === 'admin'; // example

  // Compose navLinks based on auth
  let navLinks = isAuthenticated ? [...userLinks] : [...publicLinks];
  if (isAuthenticated && isAdmin) {
    navLinks = [...navLinks, ...adminLinks];
  }

  return (
    <header className="bg-blue-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Hospital Management</h1>
        <nav className="space-x-4 hidden md:block">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`hover:underline ${
                pathname === link.href ? 'font-semibold text-yellow-300' : ''
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
