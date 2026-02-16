// app/register/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation"; 
import Header from "@/components/Header"; 
import Footer from "@/components/Footer"; 

export default function RegisterPage() {
  const router = useRouter(); 

  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    phone: "",
    street: "", 
    city: "",
    state: "",
    zipCode: "",
    country: "",
    dateOfBirth: "",
    gender: "",
  });
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setIsSuccess(false);

    if (!form.name || !form.surname || !form.email || !form.password) {
      setMessage(
        "Please fill out all essential fields (Name, Surname, Email, Password)."
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setMessage("Please enter a valid email address.");
      return;
    }

    if (form.phone && !/^\d{10}$/.test(form.phone)) {
      setMessage("Please enter a valid 10-digit phone number (optional).");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: form.name,
        surname: form.surname,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
        address: {
          street: form.street || undefined,
          city: form.city || undefined,
          state: form.state || undefined,
          zipCode: form.zipCode || undefined,
          country: form.country || undefined,
        },
        dateOfBirth: form.dateOfBirth || undefined,
        gender: form.gender || undefined,
      };

     if (Object.values(payload.address).every((val) => val === undefined)) {
       delete (payload as any).address;
     }

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseBody = await res.text();
      let data;

      try {
        data = JSON.parse(responseBody);
      } catch (e) {
        console.error("Failed to parse response:", responseBody);
        setMessage("Invalid server response. Please try again.");
        return;
      }

      if (!res.ok) {
        // If the API route returns validation errors, display them
        if (data.errors && Array.isArray(data.errors)) {
          setMessage(data.errors.join(", ") || "Registration failed.");
        } else {
          setMessage(data.message || "Registration failed.");
        }
        setIsSuccess(false);
        return;
      }

      setIsSuccess(true);
      setMessage("Registration successful! You will be redirected to login.");
      setForm({
        // Clear form fields after successful registration
        name: "",
        surname: "",
        email: "",
        password: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        dateOfBirth: "",
        gender: "",
      });

      // Redirect to login page after a delay
      setTimeout(() => {
        router.push("/login");
      }, 2000);
      
    } catch (error: any) {
      console.error("Fetch error during registration:", error);
      setMessage(error.message || "Network error occurred. Please try again.");
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="flex min-h-screen bg-gray-50 items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl w-full space-y-8 bg-white p-10 rounded-lg shadow-xl">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create Your Account
          </h2>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-6"
            aria-describedby="form-message"
          >
            <div className="rounded-md shadow-sm -space-y-px">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="name" className="sr-only">
                    First Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="First Name"
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="surname" className="sr-only">
                    Last Name
                  </label>
                  <input
                    id="surname"
                    type="text"
                    name="surname"
                    value={form.surname}
                    onChange={handleChange}
                    placeholder="Last Name"
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="mb-4">
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email address"
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="phone" className="sr-only">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel" // Use tel for phone numbers
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Phone Number (e.g., 1234567890)"
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* Password */}
              <div className="mb-4">
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>

              {/* Address Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="street" className="sr-only">
                    Street Address
                  </label>
                  <input
                    id="street"
                    type="text"
                    name="street"
                    value={form.street}
                    onChange={handleChange}
                    placeholder="Street Address"
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="sr-only">
                    City
                  </label>
                  <input
                    id="city"
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="City"
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="state" className="sr-only">
                    State/Province
                  </label>
                  <input
                    id="state"
                    type="text"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="State/Province"
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="zipCode" className="sr-only">
                    Zip Code
                  </label>
                  <input
                    id="zipCode"
                    type="text"
                    name="zipCode"
                    value={form.zipCode}
                    onChange={handleChange}
                    placeholder="Zip Code"
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="country" className="sr-only">
                    Country
                  </label>
                  <input
                    id="country"
                    type="text"
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    placeholder="Country"
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Date of Birth and Gender */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    htmlFor="dateOfBirth"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Date of Birth
                  </label>
                  <input
                    id="dateOfBirth"
                    type="date"
                    name="dateOfBirth"
                    value={form.dateOfBirth}
                    onChange={handleChange}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="gender"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-900 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Registering..." : "Register"}
              </button>
            </div>
          </form>

          <div className="my-6 text-center">
            <p className="mb-2 text-gray-600">Or register with</p>
            <button
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <svg
                className="h-5 w-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                {/* Google Icon SVG */}
                <path
                  fillRule="evenodd"
                  d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10c4.912 0 9.07-3.618 9.778-8.473h-2.124A7.876 7.876 0 0010 17.876c-4.341 0-7.876-3.535-7.876-7.876S5.659 2.124 10 2.124c2.27 0 4.316.947 5.753 2.502L18.45 2.124A9.993 9.993 0 0010 0zM10 4.375c-1.378 0-2.67.57-3.627 1.623L3.81 3.81A7.876 7.876 0 0110 2.124c2.585 0 4.887.89 6.726 2.417l-1.921 1.921C13.298 5.17 11.75 4.375 10 4.375zM10 6.625c-.718 0-1.4.15-2.025.438L5.3 7.81A7.876 7.876 0 0110 6.625c1.688 0 3.205.617 4.398 1.623l-1.921 1.921C11.728 8.445 10.9 7.875 10 7.875z"
                  clipRule="evenodd"
                />
              </svg>
              Continue with Google
            </button>
          </div>

          {message && (
            <p
              id="form-message"
              className={`mt-4 text-sm text-center font-medium ${
                isSuccess ? "text-green-600" : "text-red-600"
              }`}
              role="alert"
            >
              {message}
            </p>
          )}

          <div className="text-sm text-center mt-6">
            <a
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Already have an account? Sign in
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
