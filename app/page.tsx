// app/page.tsx
"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  FaNotesMedical,
  FaUserMd,
  FaUsersCog,
  FaLock,
  FaCalendarCheck,
  FaChartLine,
} from "react-icons/fa";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Hero Section */}
      <main
        className="flex-1 bg-cover bg-center text-white px-4 py-48 min-h-[700px] flex items-center justify-center" 
        style={{
          backgroundImage: "url('/bg-pic.webp')",
        }}
      >
      </main>

      {/* Features Section */}
      <section className="bg-white py-20 px-6 text-center">
        <h2 className="text-4xl font-bold text-blue-900 mb-8">Core Features</h2>
        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto text-left">
          {[
            {
              title: "Patient Records",
              description:
                "Centralized patient profiles with real-time updates and history tracking.",
              icon: <FaNotesMedical className="text-blue-500 w-10 h-10 mb-4" />,
            },
            {
              title: "Doctor Dashboard",
              description:
                "A smart interface for doctors to manage appointments, notes, and records.",
              icon: <FaUserMd className="text-green-500 w-10 h-10 mb-4" />,
            },
            {
              title: "Role-Based Access",
              description:
                "Admins, doctors, and patients all see tailored dashboards and permissions.",
              icon: <FaUsersCog className="text-purple-500 w-10 h-10 mb-4" />, 
            },
            {
              title: "Secure Data",
              description:
                "HIPAA-compliant architecture for peace of mind and privacy.",
              icon: <FaLock className="text-red-500 w-10 h-10 mb-4" />,
            },
            {
              title: "Appointment Management",
              description:
                "Easily schedule, modify, or cancel appointments with automated reminders.",
              icon: (
                <FaCalendarCheck className="text-yellow-500 w-10 h-10 mb-4" />
              ),
            },
            {
              title: "Analytics & Reports",
              description:
                "Insightful reports for administrators to track operations and performance.",
              icon: <FaChartLine className="text-teal-500 w-10 h-10 mb-4" />,
            },
          ].map(
            (
              { title, description, icon }
            ) => (
              <div
                key={title}
                className="bg-gray-50 p-6 rounded-lg shadow hover:shadow-lg transition flex flex-col items-center text-center" // Centered content in card
              >
                {icon}
                <h3 className="text-xl font-semibold text-blue-800 mb-2">
                  {title}
                </h3>
                <p className="text-gray-600">{description}</p>
              </div>
            )
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-20 px-6 text-center">
        <h2 className="text-3xl font-bold text-blue-900 mb-10">
          What Professionals Are Saying
        </h2>
        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {[
            {
              quote:
                "This system completely transformed how we run our hospital. It’s efficient, clean, and makes patient care so much easier.",
              name: "Dr. Sara L.",
              role: "Chief Medical Officer",
            },
            {
              quote:
                "Managing my appointments and viewing patient notes has never been this smooth. Highly recommended!",
              name: "Dr. James K.",
              role: "Orthopedic Surgeon",
            },
            {
              quote:
                "As an administrator, I love the reporting tools. Everything is transparent and easy to access.",
              name: "Anna D.",
              role: "Hospital Admin",
            },
          ].map(({ quote, name, role }) => (
            <div
              key={name}
              className="bg-white p-6 rounded-lg shadow-md text-left"
            >
              <p className="text-gray-700 italic mb-4">“{quote}”</p>
              <p className="text-blue-900 font-bold">{name}</p>
              <p className="text-gray-500 text-sm">{role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-100 text-gray-800 py-20 px-6 text-center">
        <h2 className="text-3xl font-bold mb-6">
          Ready to transform your hospital operations?
        </h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto">
          Sign up today to experience the power of a connected, cloud-based
          hospital management system that puts people first.
        </p>
        <Link
          href="/register"
          className="bg-blue-700 text-white hover:bg-blue-800 font-semibold py-3 px-8 rounded-lg transition text-lg shadow-md transform hover:scale-105"
        >
          Get Started
        </Link>
      </section>

      <Footer />
    </div>
  );
}
