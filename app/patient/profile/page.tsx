// app/patient/profile/page.tsx
"use client";

import PatientSidebar from "@/components/Sidebar/PatientSidebar";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

// Define the shape of the patient's profile data based on your Mongoose schema
type PatientProfileFormData = {
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
  dateOfBirth: string;
  gender: "Male" | "Female" | "";
};

export default function PatientProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  // State to manage form inputs
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const formatDateForInput = (dateString: string | Date | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  };

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
    setMessage(null);
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
      dateOfBirth,
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

  // Function to reset form fields to their initial session values
  const handleReset = () => {
    if (session?.user) {
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
    setMessage(null); // Clear any messages
  };

  const handleChangePassword = () => {
    router.push("/patient/profile/change-password");
  };

  if (status === "loading") {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600 text-lg">Loading profile...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-gray-100">
        <p className="text-red-500 text-lg">
          You must be logged in to view this page.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <div className="flex flex-1">
        <PatientSidebar />
        <main className="flex-1 p-8 flex flex-col items-center">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
            <h1 className="text-4xl font-bold text-blue-900 mb-8 text-center">
              Your Profile
            </h1>

            {message && (
              <div
                className={`mb-6 p-4 rounded-lg border text-center text-lg font-medium ${
                  message.type === "success"
                    ? "bg-green-100 text-green-700 border-green-200"
                    : "bg-red-100 text-red-700 border-red-200"
                }`}
              >
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-gray-700 text-lg font-semibold mb-2"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800"
                  required
                />
              </div>

              {/* Surname */}
              <div>
                <label
                  htmlFor="surname"
                  className="block text-gray-700 text-lg font-semibold mb-2"
                >
                  Surname
                </label>
                <input
                  type="text"
                  id="surname"
                  name="surname"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-gray-700 text-lg font-semibold mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-gray-700 text-lg font-semibold mb-2"
                >
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800"
                  required
                />
              </div>

              {/* Address Fields */}
              <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4">
                Address Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="street"
                    className="block text-gray-700 text-lg font-semibold mb-2"
                  >
                    Street
                  </label>
                  <input
                    type="text"
                    id="street"
                    name="street"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="city"
                    className="block text-gray-700 text-lg font-semibold mb-2"
                  >
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="state"
                    className="block text-gray-700 text-lg font-semibold mb-2"
                  >
                    State
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="zipCode"
                    className="block text-gray-700 text-lg font-semibold mb-2"
                  >
                    Zip Code
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label
                    htmlFor="country"
                    className="block text-gray-700 text-lg font-semibold mb-2"
                  >
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800"
                    required
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label
                  htmlFor="dateOfBirth"
                  className="block text-gray-700 text-lg font-semibold mb-2"
                >
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800"
                  required
                />
              </div>

              {/* Gender */}
              <div>
                <label
                  htmlFor="gender"
                  className="block text-gray-700 text-lg font-semibold mb-2"
                >
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-white"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              {/* Role (Read-Only) */}
              <div>
                <label
                  htmlFor="role"
                  className="block text-gray-700 text-lg font-semibold mb-2"
                >
                  Role
                </label>
                <input
                  type="text"
                  id="role"
                  name="role"
                  value={session?.user?.role || "N/A"}
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed text-gray-700"
                  readOnly
                />
              </div>

              {/* Form Actions - Save and Reset Buttons */}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-300 transition-colors duration-200 shadow-md"
                  disabled={isSubmitting}
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-blue-700 text-white font-semibold rounded-full hover:bg-blue-800 transition-colors duration-200 shadow-lg transform hover:scale-105"
                >
                  {isSubmitting ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>

            {/* Separate section for Change Password */}
            <div className="mt-10 pt-6 border-t border-gray-200 text-center">
              <h2 className="text-2xl font-bold text-blue-900 mb-4">
                Change Password
              </h2>
              <p className="text-gray-700 mb-4">
                You can update your account password here for enhanced security.
              </p>
              <button
                type="button"
                onClick={handleChangePassword}
                className="px-6 py-3 bg-yellow-600 text-white font-semibold rounded-full hover:bg-yellow-700 transition-colors duration-200 shadow-md transform hover:scale-105"
              >
                Change Password
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
