// app/admin/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { FaEdit, FaTrash, FaKey } from "react-icons/fa";
import PatientEditModal from "@/components/Modals/PatientEditModal";
import PatientPasswordChangeModal from '@/components/Modals/PatientPasswordChangeModal';
import { toast } from "react-toastify";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Define the interface for Patient data (matching your database fields, excluding password)
interface Patient {
  _id: string;
  name: string;
  surname: string;
  email: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  dateOfBirth?: string; // Stored as ISO string, will need formatting for date input
  gender?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();

  // State for Patient Management
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [patientsError, setPatientsError] = useState<string | null>(null);

  // State for modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);

  // Dummy Data for Quick Statistics
  const stats = {
    patients: { count: 348, increase: 20 },
    appointments: { count: 1585, decrease: 15 },
    totalRevenue: { amount: 7300, increase: 10 },
  };

  // Dummy Data for Appointments Year by Year Chart (Line Chart)
  const appointmentsChartData = {
    labels: [
      "2016-03",
      "2016-06",
      "2016-09",
      "2016-12",
      "2017-03",
      "2017-06",
      "2017-09",
      "2017-12",
      "2018-03",
      "2018-06",
    ],
    datasets: [
      {
        label: "Appointments",
        data: [17.5, 30, 20, 45, 15, 35, 25, 40, 18, 55],
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  const appointmentsChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Appointments Year by Year",
        font: { size: 16 },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, grid: { color: "rgba(200, 200, 200, 0.2)" } },
    },
  };

  // Dummy Data for Patients Year by Year Chart (Bar Chart)
  const patientsChartData = {
    labels: ["2012", "2013", "2014", "2015", "2016", "2017", "2018"],
    datasets: [
      {
        label: "Patients",
        data: [45, 55, 60, 35, 30, 40, 50],
        backgroundColor: "rgba(53, 162, 235, 0.8)",
      },
    ],
  };

  const patientsChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Patients Year by Year",
        font: { size: 16 },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, grid: { color: "rgba(200, 200, 200, 0.2)" } },
    },
  };

  // Dummy Data for Appointments Table (Already exists)
  const appointmentsTableData = [
    {
      patientName: "Rajesh",
      doctor: "Mancy Kumar",
      checkUp: "Dental",
      date: "12-10-2018",
      time: "12:10PM",
      status: "Completed",
    },
    {
      patientName: "Riya",
      doctor: "Daniel",
      checkUp: "Ortho",
      date: "12-10-2018",
      time: "1:10PM",
      status: "Pending",
    },
    {
      patientName: "Siri",
      doctor: "Daniel",
      checkUp: "Ortho",
      date: "12-10-2018",
      time: "1:30PM",
      status: "Cancelled",
    },
    {
      patientName: "Rajesh",
      doctor: "Mancy Kumar",
      checkUp: "Dental",
      date: "12-10-2018",
      time: "12:10PM",
      status: "Completed",
    },
    {
      patientName: "Riya",
      doctor: "Daniel",
      checkUp: "Ortho",
      date: "12-10-2018",
      time: "1:10PM",
      status: "Pending",
    },
    {
      patientName: "Siri",
      doctor: "Daniel",
      checkUp: "Ortho",
      date: "12-10-2018",
      time: "1:30PM",
      status: "Cancelled",
    },
  ];

  const getStatusClasses = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Function to fetch patients data
  const fetchPatients = async () => {
    setPatientsLoading(true);
    setPatientsError(null);
    try {
      const res = await fetch("/api/patients"); // Fetch from your new API route
      const data = await res.json();
      if (res.ok) {
        setPatients(data.data);
      } else {
        setPatientsError(data.message || "Failed to fetch patients");
        toast.error(data.message || "Failed to fetch patients");
      }
    } catch (err) {
      console.error("Fetch patients error:", err);
      setPatientsError("Network error or server unreachable for patients data");
      toast.error("Network error or server unreachable for patients data");
    } finally {
      setPatientsLoading(false);
    }
  };

  // Fetch patients on component mount and if session changes
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      fetchPatients();
    }
  }, [session, status]);

  // Handlers for Patient Management actions
  const handleEditClick = (patient: Patient) => {
    setCurrentPatient(patient);
    setIsEditModalOpen(true);
  };

  const handlePasswordChangeClick = (patient: Patient) => {
    setCurrentPatient(patient);
    setIsPasswordModalOpen(true);
  };

  const handleDeleteClick = async (patientId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this patient? This action cannot be undone."
      )
    ) {
      return;
    }
    try {
      const res = await fetch(`/api/patients/${patientId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Patient deleted successfully!");
        fetchPatients(); // Refresh the list
      } else {
        toast.error(data.message || "Failed to delete patient.");
      }
    } catch (error) {
      console.error("Delete patient error:", error);
      toast.error("Network error or server unreachable.");
    }
  };

  const handlePatientUpdate = async (updatedPatient: Patient) => {
    try {
      const res = await fetch(`/api/patients/${updatedPatient._id}`, {
        method: "PUT", // Or PATCH depending on your API
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedPatient),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Patient updated successfully!");
        setIsEditModalOpen(false);
        fetchPatients(); // Refresh the list
      } else {
        toast.error(data.message || "Failed to update patient.");
      }
    } catch (error) {
      console.error("Update patient error:", error);
      toast.error("Network error or server unreachable.");
    }
  };

  const handlePasswordUpdate = async (
    patientId: string,
    newPassword: string
  ) => {
    try {
      const res = await fetch(`/api/patients/change-password/${patientId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Patient password updated successfully!");
        setIsPasswordModalOpen(false);
      } else {
        toast.error(data.message || "Failed to update password.");
      }
    } catch (error) {
      console.error("Password update error:", error);
      toast.error("Network error or server unreachable.");
    }
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  if (status === "unauthenticated" || session?.user?.role !== "admin") {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-red-600 text-lg">
          Access Denied: You must be an admin to view this dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />

      <div className="flex flex-1">
        {/* Removed AdminSidebar */}
        {/* <AdminSidebar /> */}

        <main className="flex-1 p-6 md:p-8 space-y-6">
          {" "}
          {/* The main content now takes full width */}
          <h1 className="text-3xl font-bold mb-6 text-gray-800">
            Admin Dashboard
          </h1>
          {/* Quick Statistics Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
              <div className="p-4 rounded-full bg-red-100 text-red-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h-4v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2H0V10a6 6 0 016-6h12a6 6 0 016 6v10h-3zM12 14a4 4 0 100-8 4 4 0 000 8z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Patients</p>
                <h2 className="text-3xl font-bold text-gray-800">
                  {stats.patients.count}
                </h2>
                <p className="text-green-500 text-sm">
                  +{stats.patients.increase}% Increased
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
              <div className="p-4 rounded-full bg-green-100 text-green-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h.01M17 11h.01M7 15h.01M17 15h.01M7 19h.01M17 19h.01M4 20h16a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Appointments</p>
                <h2 className="text-3xl font-bold text-gray-800">
                  {stats.appointments.count}
                </h2>
                <p className="text-red-500 text-sm">
                  -{stats.appointments.decrease}% Decreased
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
              <div className="p-4 rounded-full bg-orange-100 text-orange-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.592 1M12 8V3m0 9v8m-5-9H7a2 2 0 00-2 2v4a2 2 0 002 2h4a2 2 0 002-2v-4a2 2 0 00-2-2h-2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Revenue</p>
                <h2 className="text-3xl font-bold text-gray-800">
                  ${stats.totalRevenue.amount}
                </h2>
                <p className="text-green-500 text-sm">
                  +{stats.totalRevenue.increase}% Increased
                </p>
              </div>
            </div>
          </div>
          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Appointments Year by Year
              </h3>
              <Line
                data={appointmentsChartData}
                options={appointmentsChartOptions}
              />
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Patients Year by Year
              </h3>
              <Bar data={patientsChartData} options={patientsChartOptions} />
            </div>
          </div>
          {/* Appointments Table Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Appointments
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Patient Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Doctor
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Check Up
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Time
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointmentsTableData.map((appointment, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {appointment.patientName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {appointment.doctor}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {appointment.checkUp}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {appointment.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {appointment.time}
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
          </div>
          {/* NEW: Patient Management Table Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Patient Management
            </h3>
            {patientsLoading ? (
              <p>Loading patient data...</p>
            ) : patientsError ? (
              <p className="text-red-500">{patientsError}</p>
            ) : patients.length === 0 ? (
              <p>No patients found in the system.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Surname
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Email
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Phone
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Address
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        DoB
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Gender
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Role
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {patients.map((patient) => (
                      <tr key={patient._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {patient.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {patient.surname}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {patient.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {patient.phone || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {patient.address
                            ? `${patient.address.street || ""}, ${
                                patient.address.city || ""
                              }`
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {patient.dateOfBirth
                            ? new Date(patient.dateOfBirth).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {patient.gender || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {patient.role}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <div className="flex justify-center items-center space-x-2">
                            <button
                              onClick={() => handleEditClick(patient)}
                              className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-100 transition duration-150"
                              title="Edit Patient"
                            >
                              <FaEdit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handlePasswordChangeClick(patient)}
                              className="text-yellow-600 hover:text-yellow-900 p-2 rounded-full hover:bg-yellow-100 transition duration-150"
                              title="Change Password"
                            >
                              <FaKey className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(patient._id)}
                              className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-100 transition duration-150"
                              title="Delete Patient"
                            >
                              <FaTrash className="w-5 h-5" />
                            </button>
                          </div>
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
      <Footer />

      {isEditModalOpen && currentPatient && (
        <PatientEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          patient={currentPatient}
          onUpdate={handlePatientUpdate}
        />
      )}

      {isPasswordModalOpen && currentPatient && (
        <PatientPasswordChangeModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          patientId={currentPatient._id}
          onPasswordUpdate={handlePasswordUpdate}
        />
      )}
    </div>
  );
}
