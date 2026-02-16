// app/admin/dashboard/page.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
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
import { FaEdit, FaTrash, FaKey, FaPlus } from "react-icons/fa"; // FaPlus is still used for Doctor/Admin Add buttons
import PatientEditModal from "@/components/Modals/PatientEditModal";
import PatientPasswordChangeModal from "@/components/Modals/PatientPasswordChangeModal";
import DoctorEditModal from "@/components/Modals/DoctorEditModal";
import DoctorPasswordChangeModal from "@/components/Modals/DoctorPasswordChangeModal";
import DoctorAddModal from "@/components/Modals/DoctorAddModal";
import AdminAddModal from "@/components/Modals/AdminAddModal";
import AdminEditModal from "@/components/Modals/AdminEditModal";
import AdminPasswordChangeModal from "@/components/Modals/AdminPasswordChangeModal";
import AppointmentEditModal from "@/components/Modals/AppointmentEditModal";

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
  Legend,
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

// Define the interface for Doctor data
interface Doctor {
  _id: string;
  name: string;
  surname: string;
  specialization: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  dateOfBirth: string; // Stored as ISO string, will need formatting for date input
  gender: "Male" | "Female";
  role: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

// Define interface for new doctor data (for API call, without confirmPassword)
interface NewDoctorDataForAPI {
  name: string;
  surname: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  dateOfBirth: string; // ISO string
  gender: "Male" | "Female";
  specialization: string;
  password: string;
}

// Define the interface for Admin data (from your provided schema)
interface Admin {
  _id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  dateOfBirth: string; // Stored as ISO string
  gender: "Male" | "Female";
  role: string; // "admin"
  lastLogin?: string; // Optional field
  createdAt: string;
  updatedAt: string;
}

// Define interface for new Admin data (for API call, without confirmPassword)
interface NewAdminDataForAPI {
  name: string;
  surname: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  dateOfBirth: string; // ISO string
  gender: "Male" | "Female";
  password: string;
}

// NEW: Define the interface for Appointment data
// Assuming the API will populate patient and doctor fields with their names/surnames
interface Appointment {
  _id: string;
  patient:
    | { _id: string; name: string; surname: string; email: string }
    | string; // Can be ObjectId string or populated object
  doctor:
    | {
        _id: string;
        name: string;
        surname: string;
        specialization: string;
        email: string;
      }
    | string; // Can be ObjectId string or populated object
  date: string; // ISO Date string from backend
  time: string; // e.g., "10:00 AM" or "14:30"
  reason: string;
  status: "Scheduled" | "Completed" | "Cancelled" | "Pending"; // Status of the appointment
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();

  // State for Patient Management
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [patientsError, setPatientsError] = useState<string | null>(null);

  // State for Doctor Management
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [doctorsError, setDoctorsError] = useState<string | null>(null);

  // NEW: State for Admin Management
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(true);
  const [adminsError, setAdminsError] = useState<string | null>(null);

  // NEW: State for Appointment Management
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(
    null,
  );

  // State for Patient Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);

  // State for Doctor Modals
  const [isDoctorEditModalOpen, setIsDoctorEditModalOpen] = useState(false);
  const [isDoctorPasswordModalOpen, setIsDoctorPasswordModalOpen] =
    useState(false);
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);
  const [isDoctorAddModalOpen, setIsDoctorAddModalOpen] = useState(false);

  // NEW: State for Admin Modals
  const [isAdminAddModalOpen, setIsAdminAddModalOpen] = useState(false);
  const [isAdminEditModalOpen, setIsAdminEditModalOpen] = useState(false);
  const [isAdminPasswordModalOpen, setIsAdminPasswordModalOpen] =
    useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);

  // NEW: State for Appointment Modals
  // Removed isAppointmentAddModalOpen
  const [isAppointmentEditModalOpen, setIsAppointmentEditModalOpen] =
    useState(false);
  const [currentAppointment, setCurrentAppointment] =
    useState<Appointment | null>(null);

  // Dummy Data for Charts (Keeping for now, actual data will come from APIs)
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

  const getStatusClasses = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      case "Scheduled": // Added Scheduled status
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Function to fetch patients data
  const fetchPatients = async () => {
    setPatientsLoading(true);
    setPatientsError(null);
    try {
      const res = await fetch("/api/patients");
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

  // Function to fetch doctors data
  const fetchDoctors = async () => {
    setDoctorsLoading(true);
    setDoctorsError(null);
    try {
      const res = await fetch("/api/doctors");
      const data = await res.json();
      if (res.ok) {
        setDoctors(data.data);
      } else {
        setDoctorsError(data.message || "Failed to fetch doctors");
        toast.error(data.message || "Failed to fetch doctors");
      }
    } catch (err) {
      console.error("Fetch doctors error:", err);
      setDoctorsError("Network error or server unreachable for doctors data");
      toast.error("Network error or server unreachable for doctors data");
    } finally {
      setDoctorsLoading(false);
    }
  };

  // NEW: Function to fetch admins data
  const fetchAdmins = async () => {
    setAdminsLoading(true);
    setAdminsError(null);
    try {
      const res = await fetch("/api/admins"); // Assuming a new API route for admins
      const data = await res.json();
      if (res.ok) {
        // Filter out the currently logged-in admin from the list to prevent self-deletion/editing issues
        const filteredAdmins = data.data.filter(
          (admin: Admin) => admin.email !== session?.user?.email,
        );
        setAdmins(filteredAdmins);
      } else {
        setAdminsError(data.message || "Failed to fetch administrators");
        toast.error(data.message || "Failed to fetch administrators");
      }
    } catch (err) {
      console.error("Fetch admins error:", err);
      setAdminsError(
        "Network error or server unreachable for administrators data",
      );
      toast.error(
        "Network error or server unreachable for administrators data",
      );
    } finally {
      setAdminsLoading(false);
    }
  };

  // NEW: Function to fetch appointments data
  const fetchAppointments = async () => {
    setAppointmentsLoading(true);
    setAppointmentsError(null);
    try {
      // Assuming a new API route for fetching all appointments (for admin)
      // This API should also populate the 'patient' and 'doctor' fields
      const res = await fetch("/api/appointments");
      const data = await res.json();
      if (res.ok) {
        setAppointments(data.data);
      } else {
        setAppointmentsError(data.message || "Failed to fetch appointments");
        toast.error(data.message || "Failed to fetch appointments");
      }
    } catch (err) {
      console.error("Fetch appointments error:", err);
      setAppointmentsError(
        "Network error or server unreachable for appointments data",
      );
      toast.error("Network error or server unreachable for appointments data");
    } finally {
      setAppointmentsLoading(false);
    }
  };

  // Fetch data on component mount and if session changes
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      fetchPatients();
      fetchDoctors();
      fetchAdmins(); // Fetch admins data as well
      fetchAppointments(); // NEW: Fetch appointments data
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
      window.confirm(
        "Are you sure you want to delete this patient? This action cannot be undone.",
      )
    ) {
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
    }
  };

  const handlePatientUpdate = async (
    updatedPatient: Omit<Patient, "createdAt" | "updatedAt">,
  ) => {
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
    newPassword: string,
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

  // Handlers for Doctor Management actions
  const handleEditDoctorClick = (doctor: Doctor) => {
    setCurrentDoctor(doctor);
    setIsDoctorEditModalOpen(true);
  };

  const handlePasswordChangeDoctorClick = (doctor: Doctor) => {
    setCurrentDoctor(doctor);
    setIsDoctorPasswordModalOpen(true);
  };

  const handleDeleteDoctorClick = async (doctorId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this doctor? This action cannot be undone.",
      )
    ) {
      try {
        const res = await fetch(`/api/doctors/${doctorId}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (res.ok) {
          toast.success(data.message || "Doctor deleted successfully!");
          fetchDoctors(); // Refresh the list
        } else {
          toast.error(data.message || "Failed to delete doctor.");
        }
      } catch (error) {
        console.error("Delete doctor error:", error);
        toast.error("Network error or server unreachable.");
      }
    }
  };

  const handleDoctorUpdate = async (updatedDoctor: Doctor) => {
    try {
      const res = await fetch(`/api/doctors/${updatedDoctor._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedDoctor),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Doctor updated successfully!");
        setIsDoctorEditModalOpen(false);
        fetchDoctors(); // Refresh the list
      } else {
        toast.error(data.message || "Failed to update doctor.");
      }
    } catch (error) {
      console.error("Update doctor error:", error);
      toast.error("Network error or server unreachable.");
    }
  };

  const handleDoctorPasswordUpdate = async (
    doctorId: string,
    newPassword: string,
  ) => {
    try {
      const res = await fetch(`/api/doctors/change-password/${doctorId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Doctor password updated successfully!");
        setIsDoctorPasswordModalOpen(false);
      } else {
        toast.error(data.message || "Failed to update password.");
      }
    } catch (error) {
      console.error("Doctor password update error:", error);
      toast.error("Network error or server unreachable.");
    }
  };

  const handleAddDoctor = async (newDoctorData: NewDoctorDataForAPI) => {
    try {
      const response = await fetch("/api/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDoctorData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add doctor.");
      }

      toast.success("Doctor added successfully!");
      setIsDoctorAddModalOpen(false); // Close the modal on success
      fetchDoctors(); // Re-fetch doctors to update the list on the dashboard
    } catch (err: any) {
      toast.error(err.message || "Error adding doctor.");
      console.error("Error adding doctor:", err);
      throw err; // Re-throw to propagate error for modal to handle if needed
    }
  };

  // NEW: Handlers for Admin Management actions
  const handleEditAdminClick = (admin: Admin) => {
    setCurrentAdmin(admin);
    setIsAdminEditModalOpen(true);
  };

  const handlePasswordChangeAdminClick = (admin: Admin) => {
    setCurrentAdmin(admin);
    setIsAdminPasswordModalOpen(true);
  };

  const handleDeleteAdminClick = async (adminId: string) => {
    // Preventing self-deletion: if the current admin tries to delete themselves, deny it.
    if (session?.user?.email === currentAdmin?.email) {
      toast.error("You cannot delete your own admin account from here.");
      return;
    }

    if (
      window.confirm(
        "Are you sure you want to delete this administrator? This action cannot be undone.",
      )
    ) {
      try {
        const res = await fetch(`/api/admins/${adminId}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (res.ok) {
          toast.success(data.message || "Administrator deleted successfully!");
          fetchAdmins(); // Refresh the list
        } else {
          toast.error(data.message || "Failed to delete administrator.");
        }
      } catch (error) {
        console.error("Delete admin error:", error);
        toast.error("Network error or server unreachable.");
      }
    }
  };

  const handleAdminUpdate = async (updatedAdmin: Admin) => {
    try {
      const res = await fetch(`/api/admins/${updatedAdmin._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedAdmin),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Administrator updated successfully!");
        setIsAdminEditModalOpen(false);
        fetchAdmins(); // Refresh the list
      } else {
        toast.error(data.message || "Failed to update administrator.");
      }
    } catch (error) {
      console.error("Update admin error:", error);
      toast.error("Network error or server unreachable.");
    }
  };

  const handleAdminPasswordUpdate = async (
    adminId: string,
    newPassword: string,
  ) => {
    try {
      const res = await fetch(`/api/admins/change-password/${adminId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Administrator password updated successfully!");
        setIsAdminPasswordModalOpen(false);
      } else {
        toast.error(data.message || "Failed to update password.");
      }
    } catch (error) {
      console.error("Admin password update error:", error);
      toast.error("Network error or server unreachable.");
    }
  };

  const handleAddAdmin = async (newAdminData: NewAdminDataForAPI) => {
    try {
      const response = await fetch("/api/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAdminData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add administrator.");
      }

      toast.success("Administrator added successfully!");
      setIsAdminAddModalOpen(false);
      fetchAdmins();
    } catch (err: any) {
      toast.error(err.message || "Error adding administrator.");
      console.error("Error adding administrator:", err);
      throw err;
    }
  };

  // Handlers for Appointment Management actions
  const handleEditAppointmentClick = (appointment: Appointment) => {
    setCurrentAppointment(appointment);
    setIsAppointmentEditModalOpen(true);
  };

  const handleDeleteAppointmentClick = async (appointmentId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this appointment? This action cannot be undone.",
      )
    ) {
      try {
        const res = await fetch(`/api/appointments/${appointmentId}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (res.ok) {
          toast.success(data.message || "Appointment deleted successfully!");
          fetchAppointments(); // Refresh the list
        } else {
          toast.error(data.message || "Failed to delete appointment.");
        }
      } catch (error) {
        console.error("Delete appointment error:", error);
        toast.error("Network error or server unreachable.");
      }
    }
  };

  const handleAppointmentUpdate = async (updatedAppointment: Appointment) => {
    try {
      const res = await fetch(`/api/appointments/${updatedAppointment._id}`, {
        method: "PUT", // Or PATCH depending on your API
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedAppointment),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Appointment updated successfully!");
        setIsAppointmentEditModalOpen(false);
        fetchAppointments(); // Refresh the list
      } else {
        toast.error(data.message || "Failed to update appointment.");
      }
    } catch (error) {
      console.error("Update appointment error:", error);
      toast.error("Network error or server unreachable.");
    }
  };

  // Removed handleAddAppointment as admin will not add appointments directly

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

  // Calculate actual total patients and appointments for stats if needed
  const totalPatients = patients.length;
  const totalAppointments = appointments.length;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />

      <div className="flex flex-1">
        {/* Placeholder for Admin Sidebar if you have one, or remove this comment */}
        {/* <AdminSidebar /> */}
        <main className="flex-1 p-6 md:p-8 space-y-6">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">
            Admin Dashboard
          </h1>
          {/* Quick Statistics Section (Updated to use live data for patients and appointments) */}
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
                  {patientsLoading ? "..." : totalPatients}
                </h2>
                {/* <p className="text-green-500 text-sm">
                  +{stats.patients.increase}% Increased
                </p> */}
                {patientsError && (
                  <p className="text-red-500 text-sm">Error loading</p>
                )}
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
                  {appointmentsLoading ? "..." : totalAppointments}
                </h2>
                {/* <p className="text-red-500 text-sm">
                  -{stats.appointments.decrease}% Decreased
                </p> */}
                {appointmentsError && (
                  <p className="text-red-500 text-sm">Error loading</p>
                )}
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
                  ${/* This data is still dummy */}7300
                </h2>
                {/* <p className="text-green-500 text-sm">
                  +{stats.totalRevenue.increase}% Increased
                </p> */}
              </div>
            </div>
          </div>
          {/* Charts Section (Kept as is with dummy data) */}
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
          {/* Appointments Table Section (Updated to use fetched data and include actions) */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Appointment Management
              </h3>
              {/* Removed the "Add Appointment" button as requested */}
            </div>

            {appointmentsLoading ? (
              <p>Loading appointments data...</p>
            ) : appointmentsError ? (
              <p className="text-red-500">{appointmentsError}</p>
            ) : appointments.length === 0 ? (
              <p>No appointments found in the system.</p>
            ) : (
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
                        Doctor Name
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
                        Reason
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
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
                    {appointments.map((appointment) => (
                      <tr key={appointment._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {/* Assuming patient is populated, otherwise just show ID or N/A */}
                          {typeof appointment.patient === "object"
                            ? `${appointment.patient.name} ${appointment.patient.surname}`
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {/* Assuming doctor is populated */}
                          {typeof appointment.doctor === "object"
                            ? `${appointment.doctor.name} ${appointment.doctor.surname}`
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(appointment.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {appointment.time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                          {appointment.reason}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(
                              appointment.status,
                            )}`}
                          >
                            {appointment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <div className="flex justify-center items-center space-x-2">
                            <button
                              onClick={() =>
                                handleEditAppointmentClick(appointment)
                              }
                              className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-100 transition duration-150"
                              title="Edit Appointment"
                            >
                              <FaEdit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteAppointmentClick(appointment._id)
                              }
                              className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-100 transition duration-150"
                              title="Delete Appointment"
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
          {/* Patient Management Table Section */}
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
          {/* Doctor Management Table Section with Add Doctor Button */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Doctor Management
              </h3>
              {/* CORRECTED: Button to open the Add Doctor Modal */}
              <button
                onClick={() => setIsDoctorAddModalOpen(true)} // Opens the modal
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full flex items-center justify-center shadow-lg transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                title="Add New Doctor"
              >
                <FaPlus className="w-5 h-5 mr-2" />
                <span>Add Doctor</span>
              </button>
            </div>
            {doctorsLoading ? (
              <p>Loading doctor data...</p>
            ) : doctorsError ? (
              <p className="text-red-500">{doctorsError}</p>
            ) : doctors.length === 0 ? (
              <p>No doctors found in the system.</p>
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
                        Specialization
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
                        className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {doctors.map((doctor) => (
                      <tr key={doctor._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {doctor.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doctor.surname}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doctor.specialization}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doctor.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doctor.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doctor.address
                            ? `${doctor.address.street}, ${doctor.address.city}`
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(doctor.dateOfBirth).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doctor.gender}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <div className="flex justify-center items-center space-x-2">
                            <button
                              onClick={() => handleEditDoctorClick(doctor)}
                              className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-100 transition duration-150"
                              title="Edit Doctor"
                            >
                              <FaEdit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() =>
                                handlePasswordChangeDoctorClick(doctor)
                              }
                              className="text-yellow-600 hover:text-yellow-900 p-2 rounded-full hover:bg-yellow-100 transition duration-150"
                              title="Change Doctor Password"
                            >
                              <FaKey className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteDoctorClick(doctor._id)
                              }
                              className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-100 transition duration-150"
                              title="Delete Doctor"
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
          {/* NEW: Admin Management Table Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Administrator Management
              </h3>
              <button
                onClick={() => setIsAdminAddModalOpen(true)} // Opens the Admin Add modal
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-full flex items-center justify-center shadow-lg transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                title="Add New Administrator"
              >
                <FaPlus className="w-5 h-5 mr-2" />
                <span>Add Administrator</span>
              </button>
            </div>
            {adminsLoading ? (
              <p>Loading administrator data...</p>
            ) : adminsError ? (
              <p className="text-red-500">{adminsError}</p>
            ) : admins.length === 0 ? (
              <p>No administrators found in the system.</p>
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
                        className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {admins.map((admin) => (
                      <tr key={admin._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {admin.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {admin.surname}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {admin.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {admin.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {admin.address
                            ? `${admin.address.street}, ${admin.address.city}`
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(admin.dateOfBirth).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {admin.gender}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <div className="flex justify-center items-center space-x-2">
                            <button
                              onClick={() => handleEditAdminClick(admin)}
                              className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-100 transition duration-150"
                              title="Edit Administrator"
                            >
                              <FaEdit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() =>
                                handlePasswordChangeAdminClick(admin)
                              }
                              className="text-yellow-600 hover:text-yellow-900 p-2 rounded-full hover:bg-yellow-100 transition duration-150"
                              title="Change Administrator Password"
                            >
                              <FaKey className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteAdminClick(admin._id)}
                              className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-100 transition duration-150"
                              title="Delete Administrator"
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
          </div>{" "}
          {/* End Admin Management Section */}
        </main>
      </div>

      <Footer />

      {/* Patient Modals */}
      {isEditModalOpen && currentPatient && (
        <PatientEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          patient={currentPatient}
          onUpdate={(updatedPatient) => {
            handlePatientUpdate(updatedPatient);
          }}
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

      {/* Doctor Modals */}
      {isDoctorEditModalOpen && currentDoctor && (
        <DoctorEditModal
          isOpen={isDoctorEditModalOpen}
          onClose={() => setIsDoctorEditModalOpen(false)}
          doctor={currentDoctor}
          onUpdate={handleDoctorUpdate as (updatedDoctor: any) => Promise<void>}
        />
      )}
      {isDoctorPasswordModalOpen && currentDoctor && (
        <DoctorPasswordChangeModal
          isOpen={isDoctorPasswordModalOpen}
          onClose={() => setIsDoctorPasswordModalOpen(false)}
          doctorId={currentDoctor._id}
          onPasswordUpdate={handleDoctorPasswordUpdate}
        />
      )}
      {isDoctorAddModalOpen && (
        <DoctorAddModal
          isOpen={isDoctorAddModalOpen}
          onClose={() => setIsDoctorAddModalOpen(false)}
          onAdd={(newDoctor) => handleAddDoctor(newDoctor as any)}
        />
      )}

      {isAdminAddModalOpen && (
        <AdminAddModal
          isOpen={isAdminAddModalOpen}
          onClose={() => setIsAdminAddModalOpen(false)}
          onAdd={(newAdmin) => handleAddAdmin(newAdmin as any)}
        />
      )}
      {isAdminEditModalOpen && currentAdmin && (
        <AdminEditModal
          isOpen={isAdminEditModalOpen}
          onClose={() => setIsAdminEditModalOpen(false)}
          admin={currentAdmin}
          onUpdate={(updatedAdmin) => handleAdminUpdate(updatedAdmin as any)}
        />
      )}
      {isAdminPasswordModalOpen && currentAdmin && (
        <AdminPasswordChangeModal
          isOpen={isAdminPasswordModalOpen}
          onClose={() => setIsAdminPasswordModalOpen(false)}
          adminId={currentAdmin._id}
          onPasswordUpdate={handleAdminPasswordUpdate}
        />
      )}

      {isAppointmentEditModalOpen && currentAppointment && (
        <AppointmentEditModal
          isOpen={isAppointmentEditModalOpen}
          onClose={() => setIsAppointmentEditModalOpen(false)}
          appointment={currentAppointment}
          onUpdate={handleAppointmentUpdate}
          patients={patients}
          doctors={doctors}
        />
      )}
    </div>
  );
}
