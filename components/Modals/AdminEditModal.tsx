// components/Modals/AdminEditModal.tsx
"use client"; // This component uses client-side hooks and features

import { useState, useEffect, FormEvent } from "react";
import { toast } from "react-toastify";

// Define the Admin interface (matching the schema provided)
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
  dateOfBirth: string; // Stored as ISO string (e.g., '2023-01-15T00:00:00.000Z')
  gender: string; // "Male" or "Female"
  role: string; // "admin"
  lastLogin?: string; // Optional field
  createdAt: string;
  updatedAt: string;
}

interface AdminEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  admin: Admin;
  onUpdate: (updatedAdmin: Admin) => Promise<void>;
}

export default function AdminEditModal({
  isOpen,
  onClose,
  admin,
  onUpdate,
}: AdminEditModalProps) {
  // Initialize formData state with admin data, formatting dateOfBirth for input type="date"
  const [formData, setFormData] = useState<Admin>({
    ...admin,
    dateOfBirth: admin.dateOfBirth
      ? new Date(admin.dateOfBirth).toISOString().split("T")[0]
      : "",
  });

  const [message, setMessage] = useState<{ type: string; text: string } | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // useEffect to reset form data when the modal is opened or a different admin is passed
  useEffect(() => {
    setFormData({
      ...admin,
      dateOfBirth: admin.dateOfBirth
        ? new Date(admin.dateOfBirth).toISOString().split("T")[0]
        : "",
    });
    setMessage(null); // Clear any previous messages
  }, [admin, isOpen]);

  // useEffect to manage body overflow (to prevent scrolling of background content when modal is open)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    // Cleanup function to restore original overflow style when component unmounts
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null; // Render nothing if the modal is not open

  // Universal change handler for input fields (including nested address fields)
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    // Check if the input name is for an address field (e.g., "address.street")
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1] as keyof Admin["address"];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      // For top-level fields
      setFormData((prev) => ({ ...prev, [name as keyof Admin]: value }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    // Client-side validation: Check if all required fields are filled
    if (
      !formData.name ||
      !formData.surname ||
      !formData.email ||
      !formData.phone ||
      !formData.address.street ||
      !formData.address.city ||
      !formData.address.state ||
      !formData.address.zipCode ||
      !formData.address.country ||
      !formData.dateOfBirth ||
      !formData.gender
    ) {
      setMessage({ type: "error", text: "Please fill all required fields." });
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare data for the API call: convert dateOfBirth back to ISO string if your backend expects it
      const updatedAdminData = {
        ...formData,
        dateOfBirth: formData.dateOfBirth
          ? new Date(formData.dateOfBirth).toISOString()
          : "",
      };

      // Call the 'onUpdate' prop provided by the parent component (AdminDashboard.tsx)
      await onUpdate(updatedAdminData);
      // The parent component is responsible for handling the API call, showing success/error
      // toasts, and then closing the modal if the update is successful.
    } catch (error: any) {
      console.error("Error updating admin in modal:", error);
      setMessage({
        type: "error",
        text:
          error.message || "Failed to update admin profile. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-40 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg mx-auto flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-2xl font-semibold text-gray-800">
            Edit Administrator Profile
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

        <form
          id="adminEditForm" // Important: Link the submit button to this form by ID
          onSubmit={handleSubmit}
          className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 overflow-y-auto flex-grow"
        >
          {/* Name Field */}
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
              spellCheck="false"
              autoCorrect="off"
              autoCapitalize="off"
            />
          </div>
          {/* Surname Field */}
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
              spellCheck="false"
              autoCorrect="off"
              autoCapitalize="off"
            />
          </div>
          {/* Email Field */}
          <div className="sm:col-span-2">
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
              spellCheck="false"
              autoCorrect="off"
              autoCapitalize="off"
            />
          </div>
          {/* Phone Field */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Phone
            </label>
            <input
              type="tel" // Use type="tel" for phone numbers
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
              spellCheck="false"
              autoCorrect="off"
              autoCapitalize="off"
            />
          </div>

          {/* Date of Birth Field */}
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
              value={formData.dateOfBirth} // Value is already formatted for 'date' type in useState
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          {/* Gender Select */}
          <div className="sm:col-span-2">
            <label
              htmlFor="gender"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm text-gray-900"
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          {/* Address Fields Section */}
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
                  value={formData.address.street}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                  spellCheck="false"
                  autoCorrect="off"
                  autoCapitalize="off"
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
                  value={formData.address.city}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                  spellCheck="false"
                  autoCorrect="off"
                  autoCapitalize="off"
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
                  value={formData.address.state}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                  spellCheck="false"
                  autoCorrect="off"
                  autoCapitalize="off"
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
                  value={formData.address.zipCode}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                  spellCheck="false"
                  autoCorrect="off"
                  autoCapitalize="off"
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
                  value={formData.address.country}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                  spellCheck="false"
                  autoCorrect="off"
                  autoCapitalize="off"
                />
              </div>
            </div>
          </div>

          {/* Role Field (Read-only) */}
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
              readOnly // This field remains read-only as it's typically set by the system
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed sm:text-sm text-gray-900"
            />
          </div>
        </form>
        {/* Action Buttons: outside the form for layout flexibility */}
        <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200 mt-auto flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="adminEditForm" // Ensures this button submits the form with id "adminEditForm"
            disabled={isSubmitting}
            className="inline-flex justify-center py-2 px-5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Updating..." : "Update Administrator"}
          </button>
        </div>
      </div>
    </div>
  );
}
