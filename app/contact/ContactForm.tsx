"use client";

import { useForm } from "react-hook-form";
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
    formState: { errors, isSubmitSuccessful },
    reset,
  } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    // For now, just log the data
    console.log("Form Submitted:", data);
    reset();
  };

  return (
    <>
      <Header />
      <main className="min-h-screen p-8 bg-white dark:bg-gray-900 dark:text-white">
        <h1 className="text-3xl font-bold mb-6">Na Kontaktoni</h1>

        {isSubmitSuccessful && (
          <div className="mb-4 p-4 bg-green-200 text-green-800 rounded">
            Faleminderit për mesazhin tuaj!
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-6">
          <div>
            <label className="block mb-1 font-semibold">Emri</label>
            <input
              {...register("name", { required: "Emri është i detyrueshëm" })}
              className="w-full p-2 border rounded"
            />
            {errors.name && <p className="text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block mb-1 font-semibold">Email</label>
            <input
              {...register("email", {
                required: "Email-i është i detyrueshëm",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Email-i nuk është valid",
                },
              })}
              className="w-full p-2 border rounded"
            />
            {errors.email && <p className="text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block mb-1 font-semibold">Mesazhi</label>
            <textarea
              {...register("message", { required: "Mesazhi është i detyrueshëm" })}
              rows={4}
              className="w-full p-2 border rounded"
            />
            {errors.message && <p className="text-red-600">{errors.message.message}</p>}
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Dërgo
          </button>
        </form>
      </main>
      <Footer />
    </>
  );
}
