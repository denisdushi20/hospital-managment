// components/Modals/AdminPasswordChangeModal.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { toast } from "react-toastify";

interface AdminPasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminId: string;
  onPasswordUpdate: (adminId: string, newPassword: string) => Promise<void>;
}

export default function AdminPasswordChangeModal({
  isOpen,
  onClose,
  adminId,
  onPasswordUpdate,
}: AdminPasswordChangeModalProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<{ type: string; text: string } | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    // Reset form and messages when modal opens or adminId changes
    if (isOpen) {
      setNewPassword("");
      setConfirmPassword("");
      setMessage(null);
      setPasswordError(null);
    }
  }, [isOpen, adminId]);

  // Effect to manage body overflow
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "newPassword") {
      setNewPassword(value);
    } else if (name === "confirmPassword") {
      setConfirmPassword(value);
    }

    // Real-time password match validation
    const currentNewPassword = name === "newPassword" ? value : newPassword;
    const currentConfirmPassword =
      name === "confirmPassword" ? value : confirmPassword;

    if (
      currentNewPassword &&
      currentConfirmPassword &&
      currentNewPassword !== currentConfirmPassword
    ) {
      setPasswordError("Passwords do not match.");
    } else {
      setPasswordError(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setPasswordError(null); // Clear password error on submit attempt

    if (!newPassword || !confirmPassword) {
      setMessage({
        type: "error",
        text: "Please fill in both password fields.",
      });
      setIsSubmitting(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      setMessage({ type: "error", text: "Passwords do not match." });
      setIsSubmitting(false);
      return;
    }

    const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;
    if (!passwordPattern.test(newPassword)) {
      setMessage({
        type: "error",
        text: "Password must be at least 8 characters long and contain at least one uppercase, one lowercase, one number, and one special character.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      await onPasswordUpdate(adminId, newPassword);
      // Parent component handles toast success and modal close
    } catch (error: any) {
      console.error("Password update error in modal:", error);
      setMessage({
        type: "error",
        text: error.message || "Failed to update password. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-40 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-auto flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-2xl font-semibold text-gray-800">
            Change Admin Password
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
          id="adminPasswordChangeForm"
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto flex-grow"
        >
          <div className="mb-4">
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={newPassword}
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
          <div className="mb-4">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handlePasswordChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
            {passwordError && (
              <p className="mt-1 text-xs text-red-600">{passwordError}</p>
            )}
          </div>
        </form>
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
            form="adminPasswordChangeForm"
            disabled={isSubmitting}
            className="inline-flex justify-center py-2 px-5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  );
}