// app/patient/appointments/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import PatientSidebar from "@/components/Sidebar/PatientSidebar";
import AppointmentAddModal from "@/components/Modals/AppointmentAddModal"; 
import { toast } from "react-toastify";
import { FaPlus, FaEye, FaTimes } from "react-icons/fa";

// Define interfaces for data types needed on this page
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

export default function PatientAppointmentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(
    null
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchPatientAppointments = async () => {
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
      console.error("Fetch patient appointments error:", err);
      setAppointmentsError("Network error or server unreachable.");
      toast.error("Network error or server unreachable for appointments.");
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const handleAddAppointment = async (newAppointmentData: any) => {
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAppointmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to book appointment.");
      }

      toast.success("Appointment booked successfully!");
      setIsAddModalOpen(false);
      fetchPatientAppointments();
    } catch (err: any) {
      toast.error(err.message || "Error booking appointment.");
      console.error("Error booking appointment:", err);
      throw err;
    }
  };

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (status === "unauthenticated" || session?.user?.role !== "patient") {
      router.replace("/login");
      toast.error("Access Denied: You must be a patient to view this page.");
      return;
    }

    if (session?.user?.role === "patient") {
      fetchPatientAppointments();
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

  if (status === "unauthenticated" || session?.user?.role !== "patient") {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <div className="flex flex-1">
        <PatientSidebar />
        <main className="flex-1 p-6 md:p-8 space-y-6">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">
            My Appointments
          </h1>

          {/* Add Appointment Button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-full flex items-center justify-center shadow-lg transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              title="Book New Appointment"
            >
              <FaPlus className="w-5 h-5 mr-2" />
              <span>Book New Appointment</span>
            </button>
          </div>

          {/* Appointments Table Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              My Booked Appointments
            </h3>

            {appointmentsLoading ? (
              <p>Loading your appointments...</p>
            ) : appointmentsError ? (
              <p className="text-red-500">{appointmentsError}</p>
            ) : appointments.length === 0 ? (
              <p>
                You have no appointments booked. Click "Book New Appointment" to
                get started!
              </p>
            ) : (
              <div className="overflow-x-auto">
                {" "}
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5" // Added w-1/5 for distribution
                      >
                        Doctor Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]" // Added w-[15%]
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]" // Added w-[10%]
                      >
                        Time
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5" // Added w-2/5, largest space
                      >
                        Reason
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]" // Added w-[10%]
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {appointments.map((appointment) => (
                      <tr key={appointment._id}>
                        <td className="px-6 py-4 whitespace-normal text-sm font-medium text-gray-900">
                          {" "}
                          {typeof appointment.doctor === "object"
                            ? `Dr. ${appointment.doctor.name} ${appointment.doctor.surname}`
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(appointment.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {appointment.time}
                        </td>
                        <td className="px-6 py-4 whitespace-normal text-sm text-gray-500">
                          {" "}
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
      {/* Appointment Add Modal */}
      {isAddModalOpen && (
        <AppointmentAddModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddAppointment}
        />
      )}
    </div>
  );
}
