// app/doctor/profile/change-password/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import DoctorSidebar from "@/components/Sidebar/DoctorSidebar";

export default function DoctorChangePasswordPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Redirect logic: Ensure only authenticated doctors can access this page
  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    if (session?.user?.role !== "doctor") {
      if (session?.user?.role === "admin") {
        router.replace("/admin/dashboard");
      } else if (session?.user?.role === "patient") {
        router.replace("/patient/dashboard");
      } else {
        router.replace("/access-denied");
      }
      return;
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    // Client-side validation
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setMessage({ type: "error", text: "All fields are required." });
      setIsSubmitting(false);
      return;
    }

    if (newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "New password must be at least 6 characters long.",
      });
      setIsSubmitting(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      setIsSubmitting(false);
      return;
    }

    // Ensure session and user ID are available before making the API call
    if (!session?.user?.id) {
      setMessage({
        type: "error",
        text: "User session ID is missing. Please log in again.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // --- CRITICAL CHANGE: API path now includes the doctor's ID from the session ---
      const response = await fetch(
        `/api/doctors/change-password/${session.user.id}`,
        {
          method: "PUT", // Use PUT or PATCH, matching your API's allowed methods
          headers: {
            "Content-Type": "application/json",
          },
          // Send both currentPassword and newPassword in the body
          body: JSON.stringify({ currentPassword, newPassword }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Password changed successfully!" });
        // Clear form fields on success
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        // Display the error message from the backend, if available
        setMessage({
          type: "error",
          text:
            data.error ||
            data.message ||
            "Failed to change password. Please try again.",
        });
      }
    } catch (error: any) {
      console.error("Error changing password:", error);
      setMessage({
        type: "error",
        text: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    );
  }

  if (status === "authenticated" && session?.user?.role !== "doctor") {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-gray-100">
        <p className="text-red-600 text-lg">Access Denied.</p>
        <button
          onClick={() => router.replace("/login")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <div className="flex flex-1">
        <DoctorSidebar />
        <main className="flex-1 p-8 flex flex-col items-center">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
            <h1 className="text-4xl font-bold text-blue-900 mb-8 text-center">
              Change Password
            </h1>

            {message && (
              <div
                className={`mb-6 p-4 rounded-lg border text-center text-lg font-medium ${
                  message.type === "success"
                    ? "bg-green-100 text-green-700 border-green-200"
                    : "bg-red-100 text-red-700 border-red-200"
                }`}
              >
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current Password */}
              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-gray-700 text-lg font-semibold mb-2"
                >
                  Current Password
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800"
                  required
                />
              </div>

              {/* New Password */}
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-gray-700 text-lg font-semibold mb-2"
                >
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800"
                  required
                />
              </div>

              {/* Confirm New Password */}
              <div>
                <label
                  htmlFor="confirmNewPassword"
                  className="block text-gray-700 text-lg font-semibold mb-2"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirmNewPassword"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800"
                  required
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-700 text-white font-semibold rounded-full hover:bg-blue-800 transition-colors duration-200 shadow-lg transform hover:scale-105"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>

            {/* Back to Profile Button - Added here */}
            <div className="mt-6 text-center">
              <button
                onClick={() => router.push("/doctor/profile")} // Path to doctor's main profile page
                className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-300 transition-colors duration-200 shadow-md"
              >
                Back to Profile
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
