// src/components/Modals/AppointmentEditModal.tsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaTimes } from "react-icons/fa"; // For the close button icon

// Define interfaces for data types needed within the modal
// These should ideally be imported from a central types file if you have one.
interface DoctorOption {
  _id: string;
  name: string;
  surname: string;
  specialization: string;
  email: string;
}

interface PatientOption {
  _id: string;
  name: string;
  surname: string;
  email: string;
}

// Interface for Appointment data, matching how it's populated from the API
interface Appointment {
  _id: string;
  patient:
    | { _id: string; name: string; surname: string; email: string }
    | string;
  doctor:
    | {
        _id: string;
        name: string;
        surname: string;
        specialization: string;
        email: string;
      }
    | string;
  date: string; // ISO Date string from backend
  time: string; // e.g., "10:00" or "14:30"
  reason: string;
  status: "Scheduled" | "Completed" | "Cancelled" | "Pending";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Define props for the AppointmentEditModal
interface AppointmentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment; // The appointment object to be edited
  onUpdate: (updatedAppointmentData: Appointment) => Promise<void>; // Function to call on update
  // Optional: Pass patients and doctors lists from parent to avoid re-fetching
  // if the parent already has them. For self-containment, we'll fetch them.
  patients?: PatientOption[]; // Optionally passed from parent (e.g., AdminDashboard)
  doctors?: DoctorOption[]; // Optionally passed from parent (e.g., AdminDashboard)
}

const AppointmentEditModal: React.FC<AppointmentEditModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onUpdate,
  patients: propPatients,
  doctors: propDoctors,
}) => {
  // Initialize state with the current appointment data
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [appointmentDate, setAppointmentDate] = useState<string>(""); // YYYY-MM-DD
  const [appointmentTime, setAppointmentTime] = useState<string>(""); // HH:MM
  const [reason, setReason] = useState<string>("");
  const [status, setStatus] = useState<
    "Scheduled" | "Completed" | "Cancelled" | "Pending"
  >(appointment.status);
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // States for dropdown data
  const [allDoctors, setAllDoctors] = useState<DoctorOption[]>(
    propDoctors || []
  );
  const [allPatients, setAllPatients] = useState<PatientOption[]>(
    propPatients || []
  );
  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Effect to populate form fields when the modal opens or appointment prop changes
  useEffect(() => {
    if (isOpen && appointment) {
      // Ensure patient and doctor are objects for initial state
      const initialPatientId =
        typeof appointment.patient === "object"
          ? appointment.patient._id
          : appointment.patient;
      const initialDoctorId =
        typeof appointment.doctor === "object"
          ? appointment.doctor._id
          : appointment.doctor;

      setSelectedPatientId(initialPatientId);
      setSelectedDoctorId(initialDoctorId);
      setAppointmentDate(
        new Date(appointment.date).toISOString().split("T")[0]
      ); // Format to YYYY-MM-DD
      setAppointmentTime(appointment.time);
      setReason(appointment.reason);
      setStatus(appointment.status);
      setNotes(appointment.notes || "");

      // Fetch doctors and patients if not provided by parent
      const fetchDropdownData = async () => {
        setDataLoading(true);
        setDataError(null);
        try {
          const [doctorsRes, patientsRes] = await Promise.all([
            propDoctors
              ? Promise.resolve({
                  ok: true,
                  json: () => ({ data: propDoctors }),
                })
              : fetch("/api/doctors"),
            propPatients
              ? Promise.resolve({
                  ok: true,
                  json: () => ({ data: propPatients }),
                })
              : fetch("/api/patients"),
          ]);

          const doctorsData = await doctorsRes.json();
          const patientsData = await patientsRes.json();

          if (doctorsRes.ok) {
            setAllDoctors(
              doctorsData.data.map((doc: any) => ({
                _id: doc._id,
                name: doc.name,
                surname: doc.surname,
                specialization: doc.specialization,
                email: doc.email,
              }))
            );
          } else {
            setDataError(doctorsData.message || "Failed to fetch doctors.");
            toast.error(
              doctorsData.message || "Failed to load doctors for selection."
            );
          }

          if (patientsRes.ok) {
            setAllPatients(
              patientsData.data.map((pat: any) => ({
                _id: pat._id,
                name: pat.name,
                surname: pat.surname,
                email: pat.email,
              }))
            );
          } else {
            setDataError(patientsData.message || "Failed to fetch patients.");
            toast.error(
              patientsData.message || "Failed to load patients for selection."
            );
          }
        } catch (error) {
          console.error("Error fetching dropdown data:", error);
          setDataError("Network error while fetching doctors/patients.");
          toast.error("Network error while loading data for selection.");
        } finally {
          setDataLoading(false);
        }
      };

      if (!propDoctors || !propPatients) {
        // Only fetch if data is not provided via props
        fetchDropdownData();
      } else {
        setDataLoading(false); // If props provided, set loading to false immediately
      }
    }
  }, [isOpen, appointment, propDoctors, propPatients]);

  // Reset internal states when modal closes (important for clean form on re-open)
  useEffect(() => {
    if (!isOpen) {
      setSelectedPatientId("");
      setSelectedDoctorId("");
      setAppointmentDate("");
      setAppointmentTime("");
      setReason("");
      setStatus("Pending"); // Reset to a default, or empty
      setNotes("");
      setIsSubmitting(false);
      setDataError(null);
      // Don't clear allDoctors/allPatients if they came from props, only if fetched here.
      if (!propDoctors) setAllDoctors([]);
      if (!propPatients) setAllPatients([]);
    }
  }, [isOpen, propDoctors, propPatients]);

  if (!isOpen) return null; // Don't render if not open

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic client-side validation
    if (
      !selectedPatientId ||
      !selectedDoctorId ||
      !appointmentDate ||
      !appointmentTime ||
      !reason ||
      !status
    ) {
      toast.error("Please fill in all required fields.");
      setIsSubmitting(false);
      return;
    }

    if (reason.length < 10) {
      toast.error(
        "Reason for appointment must be at least 10 characters long."
      );
      setIsSubmitting(false);
      return;
    }

    // Prepare updated data - ensure IDs are sent as strings, not objects
    const updatedAppointmentData: Appointment = {
      ...appointment, // Keep existing fields that aren't directly edited
      patient: selectedPatientId,
      doctor: selectedDoctorId,
      date: appointmentDate, // Keep as YYYY-MM-DD string for API consistency
      time: appointmentTime,
      reason: reason,
      status: status,
      notes: notes || undefined, // Ensure empty string becomes undefined for optional field
    };

    try {
      await onUpdate(updatedAppointmentData); // Call the onUpdate prop
      onClose(); // Close modal on success
    } catch (error) {
      // Error handling is managed by onUpdate in the parent, but reset submitting state
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 overflow-auto p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md relative animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors duration-200"
          title="Close"
        >
          <FaTimes className="w-6 h-6" />
        </button>
        <h2 className="text-3xl font-bold text-blue-900 mb-6 text-center">
          Edit Appointment
        </h2>

        {dataLoading ? (
          <p className="text-gray-600 text-center">
            Loading patient and doctor data...
          </p>
        ) : dataError ? (
          <p className="text-red-500 text-center">{dataError}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Patient Selection */}
            <div>
              <label
                htmlFor="patient"
                className="block text-gray-700 text-lg font-semibold mb-2"
              >
                Patient
              </label>
              <select
                id="patient"
                name="patient"
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-white"
                required
              >
                <option value="">-- Select Patient --</option>
                {allPatients.map((patient) => (
                  <option key={patient._id} value={patient._id}>
                    {patient.name} {patient.surname} ({patient.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Doctor Selection */}
            <div>
              <label
                htmlFor="doctor"
                className="block text-gray-700 text-lg font-semibold mb-2"
              >
                Doctor
              </label>
              <select
                id="doctor"
                name="doctor"
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-white"
                required
              >
                <option value="">-- Select Doctor --</option>
                {allDoctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    Dr. {doctor.name} {doctor.surname} ({doctor.specialization})
                  </option>
                ))}
              </select>
            </div>

            {/* Date Input */}
            <div>
              <label
                htmlFor="appointmentDate"
                className="block text-gray-700 text-lg font-semibold mb-2"
              >
                Appointment Date
              </label>
              <input
                type="date"
                id="appointmentDate"
                name="appointmentDate"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800"
                required
              />
            </div>

            {/* Time Input */}
            <div>
              <label
                htmlFor="appointmentTime"
                className="block text-gray-700 text-lg font-semibold mb-2"
              >
                Appointment Time
              </label>
              <input
                type="time"
                id="appointmentTime"
                name="appointmentTime"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800"
                required
              />
            </div>

            {/* Reason for Appointment */}
            <div>
              <label
                htmlFor="reason"
                className="block text-gray-700 text-lg font-semibold mb-2"
              >
                Reason for Appointment
              </label>
              <textarea
                id="reason"
                name="reason"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Briefly describe the reason for the appointment."
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800"
                required
              ></textarea>
            </div>

            {/* Status Selection */}
            <div>
              <label
                htmlFor="status"
                className="block text-gray-700 text-lg font-semibold mb-2"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value as
                      | "Scheduled"
                      | "Completed"
                      | "Cancelled"
                      | "Pending"
                  )
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-white"
                required
              >
                <option value="Pending">Pending</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Optional Notes */}
            <div>
              <label
                htmlFor="notes"
                className="block text-gray-700 text-lg font-semibold mb-2"
              >
                Additional Notes (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any other details about the appointment."
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800"
              ></textarea>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSubmitting || dataLoading}
                className="px-6 py-3 bg-blue-700 text-white font-semibold rounded-full hover:bg-blue-800 transition-colors duration-200 shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AppointmentEditModal;