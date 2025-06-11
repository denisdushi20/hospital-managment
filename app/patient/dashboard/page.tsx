"use client";

import PatientSidebar from "@/components/Sidebar/PatientSidebar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function PatientDashboard() {
  const { data: session } = useSession();
  const router = useRouter();

  const goToProfile = () => {
    router.push("/patient/profile"); 
  };

  const goToAppointments = () => {
    router.push("/patient/appointments");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Added background color */}
      <PatientSidebar />
      <main className="flex-1 p-8 flex flex-col items-center justify-center">
        {/* Centered content */}
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl text-center">
          {/* Card-like container */}
          <h1 className="text-4xl font-extrabold text-blue-700 mb-4">
            Welcome to Your Dashboard,{" "}
            <span className="capitalize">
              {session?.user?.name || "Patient"}
            </span>
            !
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Here you can manage your profile and access important information.
          </p>
          {/* Placeholder for future sections like Profile, Appointments, etc. */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-blue-50 p-6 rounded-md text-blue-800 border border-blue-200">
              <h2 className="text-2xl font-semibold mb-2">My Profile</h2>
              <p>
                Manage your personal details, change password, and update
                contact information.
              </p>
              <button
                onClick={goToProfile}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Go to Profile
              </button>
            </div>
            <div className="bg-green-50 p-6 rounded-md text-green-800 border border-green-200">
              <h2 className="text-2xl font-semibold mb-2">Appointments</h2>
              <p>
                View your upcoming and past appointments. Schedule new ones.
              </p>
              <button
                onClick={goToAppointments}
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                View Appointments
              </button>
            </div>
            {/* You can add more sections here */}
          </div>
        </div>
        <div className="mt-auto w-full max-w-2xl"> </div>
      </main>
    </div>
  );
}
