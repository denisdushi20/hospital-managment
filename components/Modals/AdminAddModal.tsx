// components/Modals/AdminAddModal.tsx
"use client"; // This component uses client-side hooks and features

import { useState, useEffect, FormEvent } from "react";
import { toast } from "react-toastify";

// Define the shape of the data for adding a NEW admin,
// matching your provided Admin Mongoose Schema fields,
// plus client-side only fields like confirmPassword.
interface NewAdminData {
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
  dateOfBirth: string; // 'YYYY-MM-DD' string for input type="date"
  gender: "Male" | "Female" | ""; // "" for initial empty state
  password: string;
  confirmPassword: string; // Client-side validation only
}

interface AdminAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  // This prop will be called by the parent component (e.g., AdminDashboard)
  // to actually send the new admin data to your API.
  onAdd: (newAdmin: Omit<NewAdminData, "confirmPassword">) => Promise<void>;
}

export default function AdminAddModal({
  isOpen,
  onClose,
  onAdd,
}: AdminAddModalProps) {
  // Initial state for the form fields for a NEW admin
  const [formData, setFormData] = useState<NewAdminData>({
    name: "",
    surname: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    dateOfBirth: "",
    gender: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState<{ type: string; text: string } | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Reset form data and messages when the modal is opened
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        surname: "",
        email: "",
        phone: "",
        address: {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "",
        },
        dateOfBirth: "",
        gender: "",
        password: "",
        confirmPassword: "",
      });
      setMessage(null);
      setPasswordError(null);
    }
  }, [isOpen]);

  // Effect to manage body overflow (to prevent scrolling of background content when modal is open)
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
      const addressField = name.split(".")[1] as keyof NewAdminData["address"];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      // For top-level fields
      setFormData((prev) => ({ ...prev, [name as keyof NewAdminData]: value }));
    }
  };

  // Special handler for password fields to include real-time matching
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Real-time password match validation
    const currentPassword = name === "password" ? value : formData.password;
    const currentConfirmPassword =
      name === "confirmPassword" ? value : formData.confirmPassword;

    if (
      currentPassword &&
      currentConfirmPassword &&
      currentPassword !== currentConfirmPassword
    ) {
      setPasswordError("Passwords do not match.");
    } else {
      setPasswordError(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setPasswordError(null); // Clear password error on submit attempt

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
      !formData.gender ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setMessage({ type: "error", text: "Please fill all required fields." });
      setIsSubmitting(false);
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage({
        type: "error",
        text: "Please enter a valid email address.",
      });
      setIsSubmitting(false);
      return;
    }

    // Phone number format validation (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      setMessage({
        type: "error",
        text: "Please enter a valid 10-digit phone number.",
      });
      setIsSubmitting(false);
      return;
    }

    // Password match validation
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match.");
      setMessage({ type: "error", text: "Passwords do not match." });
      setIsSubmitting(false);
      return;
    }

    // Password strength validation (matches the pattern)
    const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;
    if (!passwordPattern.test(formData.password)) {
      setMessage({
        type: "error",
        text: "Password must be at least 8 characters long and contain at least one uppercase, one lowercase, one number, and one special character.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare data for the API call (omit confirmPassword as it's client-side only)
      const { confirmPassword, ...dataToSend } = formData;
      // Convert dateOfBirth to ISO string before sending to backend
      const finalNewAdminData = {
        ...dataToSend,
        dateOfBirth: dataToSend.dateOfBirth
          ? new Date(dataToSend.dateOfBirth).toISOString()
          : "",
      };

      // Call the 'onAdd' prop provided by the parent component
      await onAdd(finalNewAdminData);
      // The parent component is responsible for handling the API call, showing toasts,
      // and then closing the modal if successful.
    } catch (error: any) {
      console.error("Error adding admin in modal:", error);
      setMessage({
        type: "error",
        text: error.message || "Failed to add admin. Please try again.",
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
            Add New Administrator
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
          id="adminAddForm" // Unique ID for this form
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
            {" "}
            {/* Email spans full width */}
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
              type="tel"
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
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          {/* Gender Select */}
          <div className="sm:col-span-2">
            {" "}
            {/* Gender spans full width */}
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

          {/* Password Fields */}
          <div className="sm:col-span-2 space-y-3">
            <h3 className="text-lg font-semibold text-gray-800">
              Account Security
            </h3>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handlePasswordChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
                pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}"
                title="Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters, including one special character."
              />
              <small className="mt-1 text-xs text-gray-500 block">
                Minimum 8 characters, at least one uppercase, one lowercase, one
                number, one special character.
              </small>
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handlePasswordChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
              {passwordError && (
                <p className="mt-1 text-xs text-red-600">{passwordError}</p>
              )}
            </div>
          </div>
        </form>
        {/* Action Buttons: outside the form to ensure they are always visible */}
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
            form="adminAddForm" // Link this button to the form with id "adminAddForm"
            disabled={isSubmitting}
            className="inline-flex justify-center py-2 px-5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Adding Admin..." : "Add Administrator"}
          </button>
        </div>
      </div>
    </div>
  );
}
