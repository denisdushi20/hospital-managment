// app/contact/page.tsx
"use client";

import { useForm } from "react-hook-form"; // Still needed for register and errors (for validation display)
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type FormData = {
  name: string;
  email: string;
  message: string;
};

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();


  // A dummy onSubmit handler for the form, or you could remove the onSubmit prop from the form entirely
  const dummyOnSubmit = () => {
    console.log("Form would submit here in a real application.");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-16 px-6 bg-gray-50 flex justify-center items-center">
        <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-xl">
          <h1 className="text-4xl font-bold text-center text-blue-900 mb-8">
            Contact Us
          </h1>

          <form onSubmit={handleSubmit(dummyOnSubmit)} className="space-y-6">
            <div>
              <label htmlFor="name" className="block mb-2 font-semibold text-gray-700 text-lg">
                Your Name
              </label>
              <input
                id="name"
                type="text"
                {...register("name", { required: "Name is required" })}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800"
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block mb-2 font-semibold text-gray-700 text-lg">
                Your Email
              </label>
              <input
                id="email"
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Please enter a valid email address",
                  },
                })}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="message" className="block mb-2 font-semibold text-gray-700 text-lg">
                Your Message
              </label>
              <textarea
                id="message"
                {...register("message", { required: "Message is required" })}
                rows={6}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800"
              />
              {errors.message && (
                <p className="text-red-600 text-sm mt-1">{errors.message.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 bg-blue-700 text-white font-semibold rounded-full hover:bg-blue-800 transition-colors duration-200 shadow-lg transform hover:scale-105 text-lg"
            >
              Send Message
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
    );
  }