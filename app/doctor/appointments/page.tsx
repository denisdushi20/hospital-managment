// app/doctor/appointments/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import DoctorSidebar from "@/components/Sidebar/DoctorSidebar";
import { toast } from "react-toastify";

interface DoctorInfo {
  _id: string;
  name: string;
  surname: string;
  specialization: string;
  email: string;
}

interface PatientInfo {
  _id: string;
  name: string;
  surname: string;
  email: string;
}

interface Appointment {
  _id: string;
  patient: PatientInfo | string;
  doctor: DoctorInfo | string;
  date: string;
  time: string;
  reason: string;
  status: "Scheduled" | "Completed" | "Cancelled" | "Pending";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function DoctorAppointmentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(
    null
  );

  // Function to fetch appointments data for the logged-in doctor
  const fetchDoctorAppointments = async () => {
    setAppointmentsLoading(true);
    setAppointmentsError(null);
    try {
      const res = await fetch("/api/appointments", {
        headers: {
        },
      });
      const data = await res.json();
      if (res.ok) {
        setAppointments(data.data);
      } else {
        setAppointmentsError(data.error || "Failed to fetch appointments");
        toast.error(data.error || "Failed to fetch appointments");
      }
    } catch (err) {
      console.error("Fetch doctor appointments error:", err);
      setAppointmentsError("Network error or server unreachable.");
      toast.error("Network error or server unreachable for appointments.");
    } finally {
      setAppointmentsLoading(false);
    }
  };


  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (status === "unauthenticated" || session?.user?.role !== "doctor") {
      router.replace("/login");
      toast.error("Access Denied: You must be a doctor to view this page.");
      return;
    }

    if (session?.user?.role === "doctor") {
      fetchDoctorAppointments();
    }
  }, [session, status, router]);

  const getStatusClasses = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      case "Scheduled":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-gray-600">Loading appointments...</p>
      </div>
    );
  }

  
  if (status === "unauthenticated" || session?.user?.role !== "doctor") {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <div className="flex flex-1">
        <DoctorSidebar />
        <main className="flex-1 p-6 md:p-8 space-y-6">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">
            My Appointments
          </h1>
          {/* Appointments Table Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              My Scheduled Appointments
            </h3>

            {appointmentsLoading ? (
              <p>Loading your appointments...</p>
            ) : appointmentsError ? (
              <p className="text-red-500">{appointmentsError}</p>
            ) : appointments.length === 0 ? (
              <p>You have no appointments scheduled.</p>
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="min-w-full table-fixed divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4" // Adjusted width
                      >
                        Patient Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]" // Adjusted width
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]" // Adjusted width
                      >
                        Time
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5" // Adjusted width, larger for reason
                      >
                        Reason
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[16%]" // Adjusted width
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appointment) => (
                      <tr key={appointment._id}>
                        <td className="px-6 py-4 whitespace-normal text-sm font-medium text-gray-900">
                          {typeof appointment.patient === "object"
                            ? `${appointment.patient.name} ${appointment.patient.surname}`
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(appointment.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {appointment.time}
                        </td>
                        <td className="px-6 py-4 whitespace-normal text-sm text-gray-500">
                          {appointment.reason}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(
                              appointment.status
                            )}`}
                          >
                            {appointment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
