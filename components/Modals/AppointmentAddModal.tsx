// src/components/Modals/AppointmentAddModal.tsx
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { FaTimes } from "react-icons/fa";

// Define props for the AppointmentAddModal
interface AppointmentAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newAppointmentData: {
    doctorId: string;
    patientId: string;
    date: string;
    time: string;
    reason: string;
    notes?: string;
    status: "Scheduled" | "Completed" | "Cancelled" | "Pending";
  }) => Promise<void>;
}

// Interface for Doctor data needed in the dropdown
interface DoctorOption {
  _id: string;
  name: string;
  surname: string;
  specialization: string;
}

const AppointmentAddModal: React.FC<AppointmentAddModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const { data: session, status } = useSession();
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [appointmentDate, setAppointmentDate] = useState<string>("");
  const [appointmentTime, setAppointmentTime] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState<boolean>(true);
  const [doctorsError, setDoctorsError] = useState<string | null>(null);

  // Fetch doctors when the modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchDoctorsForDropdown = async () => {
        setDoctorsLoading(true);
        setDoctorsError(null);
        try {
          const res = await fetch("/api/doctors");
          const data = await res.json();
          if (res.ok) {
            setDoctors(
              data.data.map((doc: any) => ({
                _id: doc._id,
                name: doc.name,
                surname: doc.surname,
                specialization: doc.specialization,
              }))
            );
          } else {
            setDoctorsError(data.message || "Failed to fetch doctors.");
            toast.error(
              data.message || "Failed to load doctors for selection."
            );
          }
        } catch (error) {
          console.error("Error fetching doctors for dropdown:", error);
          setDoctorsError("Network error while fetching doctors.");
          toast.error("Network error while loading doctors for selection.");
        } finally {
          setDoctorsLoading(false);
        }
      };
      fetchDoctorsForDropdown();
    }
  }, [isOpen]);


  useEffect(() => {
    if (!isOpen) {
      setSelectedDoctorId("");
      setAppointmentDate("");
      setAppointmentTime("");
      setReason("");
      setNotes("");
      setDoctors([]);
      setDoctorsLoading(true);
      setDoctorsError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!session?.user?.id) {
      toast.error("Patient session not found. Please log in again.");
      setIsSubmitting(false);
      return;
    }

 
    if (!selectedDoctorId || !appointmentDate || !appointmentTime || !reason) {
      toast.error(
        "Please fill in all required fields (Doctor, Date, Time, Reason)."
      );
      setIsSubmitting(false);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(appointmentDate);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      toast.error("Appointment date cannot be in the past.");
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

    const newAppointmentData = {
      doctorId: selectedDoctorId,
      patientId: session.user.id,
      date: appointmentDate,
      time: appointmentTime,
      reason,
      notes: notes || undefined, 
      status: "Pending" as "Pending", 
    };

    try {
      await onAdd(newAppointmentData); 
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white bg-opacity-75 flex justify-center z-50 overflow-y-auto py-8 px-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md relative animate-fade-in-up max-h-[calc(100vh-4rem)] overflow-y-auto">
        {" "}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors duration-200"
          title="Close"
        >
          <FaTimes className="w-6 h-6" />
        </button>
        <h2 className="text-3xl font-bold text-blue-900 mb-6 text-center">
          Book New Appointment
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Doctor Selection */}
          <div>
            <label
              htmlFor="doctor"
              className="block text-gray-700 text-lg font-semibold mb-2"
            >
              Select Doctor
            </label>
            {doctorsLoading ? (
              <p className="text-gray-500">Loading doctors...</p>
            ) : doctorsError ? (
              <p className="text-red-500">{doctorsError}</p>
            ) : doctors.length === 0 ? (
              <p className="text-yellow-600">
                No doctors available. Please contact support.
              </p>
            ) : (
              <select
                id="doctor"
                name="doctor"
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-white"
                required
              >
                <option value="">-- Select a Doctor --</option>
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    Dr. {doctor.name} {doctor.surname} ({doctor.specialization})
                  </option>
                ))}
              </select>
            )}
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
              min={new Date().toISOString().split("T")[0]} // Prevents selecting past dates
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
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Briefly describe the reason for your appointment (e.g., Annual Check-up, Flu Symptoms, Follow-up)."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800"
              required
            ></textarea>
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
              placeholder="Any other details you want the doctor to know?"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800"
            ></textarea>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting || doctorsLoading || doctorsError !== null}
              className="px-6 py-3 bg-blue-700 text-white font-semibold rounded-full hover:bg-blue-800 transition-colors duration-200 shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Booking..." : "Book Appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentAddModal;
