// components/Modals/PatientEditModal.tsx
import { useState, useEffect, FormEvent } from "react";
import { toast } from "react-toastify";

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
  dateOfBirth?: string;
  gender?: string;
  role: string;
}

interface PatientEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onUpdate: (updatedPatient: Patient) => void;
}

export default function PatientEditModal({
  isOpen,
  onClose,
  patient,
  onUpdate,
}: PatientEditModalProps) {
  const [formData, setFormData] = useState<Patient>(patient);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false); // For button disabled state

  useEffect(() => {
    setFormData(patient);
    setMessage(null); // Reset message when modal opens or patient changes
  }, [patient, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null); // Clear previous messages

    // Basic validation
    if (!formData.name || !formData.surname || !formData.email) {
      setMessage({
        type: "error",
        text: "Name, surname, and email are required.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      onUpdate(formData);
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error) {
      console.error("Error in modal update handler:", error);
      setMessage({
        type: "error",
        text: "Failed to update profile. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white bg-opacity-40 p-4 overflow-y-auto max-h-screen">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg mx-auto transform transition-all scale-100 opacity-100 flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-2xl font-semibold text-gray-800">
            Edit Patient Profile
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            aria-label="Close"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Message Display Area */}
        {message && (
          <div
            className={`p-3 mx-6 mt-4 rounded-md text-sm ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Modal Form Content: Main area for inputs */}
        <form
          onSubmit={handleSubmit}
          className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 flex-grow"
        >
          {/* Patient Details */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label
              htmlFor="surname"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Surname
            </label>
            <input
              type="text"
              id="surname"
              name="surname"
              value={formData.surname}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Phone
            </label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone || ""}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Date of Birth and Gender */}
          <div>
            <label
              htmlFor="dateOfBirth"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Date of Birth
            </label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth?.split("T")[0] || ""}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="gender"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender || ""}
              onChange={handleChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm text-gray-800"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Address fields - Simplified layout */}
          <div className="sm:col-span-2 space-y-3">
            <h3 className="text-lg font-semibold text-gray-800">Address</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
              <div>
                <label
                  htmlFor="address.street"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Street
                </label>
                <input
                  type="text"
                  id="address.street"
                  name="address.street"
                  value={formData.address?.street || ""}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="address.city"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  City
                </label>
                <input
                  type="text"
                  id="address.city"
                  name="address.city"
                  value={formData.address?.city || ""}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="address.state"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  State
                </label>
                <input
                  type="text"
                  id="address.state"
                  name="address.state"
                  value={formData.address?.state || ""}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="address.zipCode"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Zip Code
                </label>
                <input
                  type="text"
                  id="address.zipCode"
                  name="address.zipCode"
                  value={formData.address?.zipCode || ""}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="address.country"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Country
                </label>
                <input
                  type="text"
                  id="address.country"
                  name="address.country"
                  value={formData.address?.country || ""}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Role (Read-only) */}
          <div className="sm:col-span-2">
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Role
            </label>
            <input
              type="text"
              id="role"
              name="role"
              value={formData.role}
              readOnly
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed sm:text-sm text-gray-800"
            />
          </div>
          {/* Action Buttons */}
          <div className="sm:col-span-2 flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-6 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Updating..." : "Update Patient"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
