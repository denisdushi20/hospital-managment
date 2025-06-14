// components/Header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { FaUserCircle } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";

export default function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAuthenticated = status === "authenticated";
  const userRole = session?.user?.role; // Get the user's role

  // Determine the dashboard link based on role
  let dashboardHref = "/dashboard";
  if (userRole === "admin") {
    dashboardHref = "/admin/dashboard";
  } else if (userRole === "doctor") {
    dashboardHref = "/doctor/dashboard";
  } else if (userRole === "patient") {
    dashboardHref = "/patient/dashboard";
  }

  const navLinks: { name: string; href: string }[] = [];
  navLinks.push({ name: "Home", href: "/" });
  navLinks.push({ name: "About Us", href: "/about" });
  // NEW: Products and Contact Us are now always available
  navLinks.push({ name: "Products", href: "/products" });
  navLinks.push({ name: "Contact Us", href: "/contact" });

  if (isAuthenticated) {
    navLinks.push({ name: "Dashboard", href: dashboardHref });
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">
          <Link
            href="/"
            className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
          >
            Hospital Management
          </Link>
        </h1>

        <nav className="space-x-6 hidden md:block">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`
                transition-colors duration-200
                ${
                  pathname === link.href
                    ? "font-semibold text-blue-600 hover:text-blue-700"
                    : "text-gray-600 hover:text-blue-600"
                }
              `}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-3 relative">
          {!isAuthenticated ? (
            <>
              <Link
                href="/login"
                className="px-4 py-2 rounded-full bg-blue-700 hover:bg-blue-600 text-white font-semibold shadow-md transition-colors duration-200"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold shadow-md transition-colors duration-200"
              >
                Register
              </Link>
            </>
          ) : (
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors duration-200 focus:outline-none"
                aria-haspopup="true"
                aria-expanded={showDropdown ? "true" : "false"}
              >
                <FaUserCircle className="w-6 h-6" />
                <span className="font-semibold text-base">
                  {session.user?.name || "User"}
                </span>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10">
                  <button
                    onClick={() => {
                      signOut({ callbackUrl: "/" });
                      setShowDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-600 transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
