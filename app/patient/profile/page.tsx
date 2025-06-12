// app/patient/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function PatientProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  // State to manage form inputs
  const [name, setName] = useState("");
  const [surname, setSurname] = useState(""); // New state
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(""); // New state
  const [street, setStreet] = useState(""); // New state for address
  const [city, setCity] = useState(""); // New state for address
  const [state, setState] = useState(""); // New state for address
  const [zipCode, setZipCode] = useState(""); // New state for address
  const [country, setCountry] = useState(""); // New state for address
  const [dateOfBirth, setDateOfBirth] = useState(""); // New state (string for input type="date")
  const [gender, setGender] = useState(""); // New state

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Helper to format Date for input type="date"
  const formatDateForInput = (dateString: string | Date | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ""; // Invalid date
    return date.toISOString().split("T")[0];
  };

  // Populate form fields with session data when it's available
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setName(session.user.name || "");
      setSurname(session.user.surname || "");
      setEmail(session.user.email || "");
      setPhone(session.user.phone || "");

      setStreet(session.user.address?.street || "");
      setCity(session.user.address?.city || "");
      setState(session.user.address?.state || "");
      setZipCode(session.user.address?.zipCode || "");
      setCountry(session.user.address?.country || "");

      setDateOfBirth(formatDateForInput(session.user.dateOfBirth ?? undefined));
      setGender(session.user.gender || "");
    }
  }, [session, status]);

  // Handle form submission for profile update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null); // Clear previous messages
    setIsSubmitting(true);

    // Basic required field validation (adjust based on your schema's required fields)
    if (!name || !email || !surname || !phone || !dateOfBirth || !gender) {
      setMessage({
        type: "error",
        text: "Please fill in all required fields (Name, Surname, Email, Phone, Date of Birth, Gender).",
      });
      setIsSubmitting(false);
      return;
    }
    if (!street || !city || !state || !zipCode || !country) {
      setMessage({ type: "error", text: "Please fill in all address fields." });
      setIsSubmitting(false);
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage({
        type: "error",
        text: "Please enter a valid email address.",
      });
      setIsSubmitting(false);
      return;
    }

    // Assemble the payload with all fields
    const payload = {
      name,
      surname,
      email,
      phone,
      address: {
        street,
        city,
        state,
        zipCode,
        country,
      },
      dateOfBirth, // Send as string, API will convert to Date
      gender,
    };

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        // If the update was successful, update the client-side session
        await update(data.user);
        setMessage({ type: "success", text: "Profile updated successfully!" });
      } else {
        setMessage({
          type: "error",
          text: data.message || data.errors?.[0] || "Failed to update profile.",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ type: "error", text: "An unexpected error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = () => {
    router.push("/patient/profile/change-password");
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-red-500">You must be logged in to view this page.</p>
        <button
          onClick={() => router.push("/login")}
          className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
        <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">
          Your Profile
        </h1>

        {message && (
          <div
            className={`p-3 rounded-md mb-4 text-sm ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>

          {/* Surname */}
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
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>

          {/* Email */}
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>

          {/* Phone */}
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
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>

          {/* Address Fields */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-800">Address</h3>
            <div>
              <label
                htmlFor="street"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Street
              </label>
              <input
                type="text"
                id="street"
                name="street"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label
                htmlFor="state"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                State
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label
                htmlFor="zipCode"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Zip Code
              </label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label
                htmlFor="country"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Country
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
          </div>

          {/* Date of Birth */}
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
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>

          {/* Gender */}
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
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            >
              <option value="" className="text-black">
                Select Gender
              </option>
              <option value="Male" className="text-black">
                Male
              </option>
              <option value="Female" className="text-black">
                Female
              </option>
            </select>
          </div>

          {/* Role (Read-Only) */}
          <div>
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
              value={session?.user?.role || "N/A"}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 cursor-not-allowed sm:text-sm"
              readOnly
            />
          </div>

          <div className="flex justify-between items-center pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Updating..." : "Update Profile"}
            </button>

            <button
              type="button"
              onClick={handleChangePassword}
              className="ml-4 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Change Password
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
