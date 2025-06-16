// app/doctor/dashboard/page.tsx
"use client";

import DoctorSidebar from "@/components/Sidebar/DoctorSidebar";
import Header from "@/components/Header";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DoctorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();



  // Handle loading state and unauthorized access
  useEffect(() => {
    if (status === "loading") {
      // Still loading session, do nothing or show a loader
      return;
    }

    // If unauthenticated, redirect to login
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // If authenticated but not a doctor (e.g., patient or admin tried to access doctor dashboard directly)
    if (session?.user?.role !== "doctor") {
      // Redirect based on role
      if (session?.user?.role === "admin") {
        router.push("/admin/dashboard");
      } else if (session?.user?.role === "patient") {
        router.push("/patient/dashboard"); // Assuming you have this route
      } else {
        router.push("/access-denied"); // Or a generic unauthorized page
      }
    }
  }, [session, status, router]);

  const goToProfile = () => {
    router.push("/doctor/profile");
  };

  const goToAppointments = () => {
    router.push("/doctor/appointments");
  };

  // Render loading state or access denied message if session is not ready or unauthorized
  if (status === "loading" || session?.user?.role !== "doctor") {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-gray-100">
        {status === "loading" ? (
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        ) : (
          <p className="text-red-600 text-lg">Access Denied: Redirecting...</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <div className="flex flex-1">
        <DoctorSidebar />
        <main className="flex-1 p-8 flex flex-col items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl text-center">
            <h1 className="text-4xl font-extrabold text-blue-700 mb-4">
              Welcome to Your Dashboard,{" "}
              <span className="capitalize">
                Dr. {session?.user?.name || "Doctor"}
              </span>
              !
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Here you can manage your schedule, patients, and medical records.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="bg-blue-50 p-6 rounded-md text-blue-800 border border-blue-200">
                <h2 className="text-2xl font-semibold mb-2">My Profile</h2>
                <p>
                  Update your personal details, professional information, and
                  change password.
                </p>
                <button
                  onClick={goToProfile}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Edit Profile
                </button>
              </div>
              <div className="bg-green-50 p-6 rounded-md text-green-800 border border-green-200">
                <h2 className="text-2xl font-semibold mb-2">
                  Manage Appointments
                </h2>
                <p>Access medical histories, and manage appointments.</p>
                <button
                  onClick={goToAppointments}
                  className="mt-4 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Go to Appointments
                </button>
              </div>
              {/* You can add more sections here */}
            </div>
          </div>
          <div className="mt-auto w-full max-w-2xl"> </div>
        </main>
      </div>
    </div>
  );
}
