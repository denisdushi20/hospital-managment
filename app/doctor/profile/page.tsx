// app/doctor/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import DoctorSidebar from "@/components/Sidebar/DoctorSidebar";

// Define the shape of the doctor's profile data based on your Mongoose schema
type DoctorProfileFormData = {
  name: string;
  surname: string;
  email: string; // Now mutable
  specialization: string;
  phone: string; // Matches your schema's 'phone' field
  address: {
    // Nested address object
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  dateOfBirth: string; // String format 'YYYY-MM-DD' for HTML input type="date"
  gender: "Male" | "Female" | ""; // Enum with an empty default for select
};

export default function DoctorProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  // State to manage form inputs
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [email, setEmail] = useState(""); // Email state
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "">("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Helper to format Date for input type="date"
  const formatDateForInput = (dateString: string | Date | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  };

  // --- Authentication, Redirection, and Initial Data Fetch ---
  useEffect(() => {
    if (status === "loading") {
      setLoadingProfile(true);
      return;
    }

    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    if (session?.user?.role !== "doctor") {
      if (session?.user?.role === "admin") {
        router.replace("/admin/dashboard");
      } else if (session?.user?.role === "patient") {
        router.replace("/patient/dashboard");
      } else {
        router.replace("/access-denied");
      }
      return;
    }

    if (status === "authenticated" && session?.user?.role === "doctor") {
      const fetchProfile = async () => {
        setMessage(null);
        setLoadingProfile(true);
        try {
          // Fetch from the /api/doctors/profile-update endpoint (as confirmed in previous turns)
          const response = await fetch("/api/doctors/profile-update");
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.message || "Failed to fetch profile data."
            );
          }
          const { data } = await response.json();

          // Populate state variables with fetched data
          setName(data.name || "");
          setSurname(data.surname || "");
          setEmail(data.email || ""); // Set email from fetched data
          setSpecialization(data.specialization || "");
          setPhone(data.phone || "");
          setStreet(data.address?.street || "");
          setCity(data.address?.city || "");
          setState(data.address?.state || "");
          setZipCode(data.address?.zipCode || "");
          setCountry(data.address?.country || "");
          setDateOfBirth(formatDateForInput(data.dateOfBirth));
          setGender(data.gender || "");
        } catch (error: any) {
          console.error("Error fetching doctor profile:", error);
          setMessage({
            type: "error",
            text: error.message || "Could not load profile. Please try again.",
          });
        } finally {
          setLoadingProfile(false);
        }
      };
      fetchProfile();
    }
  }, [session, status, router]);

  // --- Form Submission Logic ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    // Manual client-side validation
    if (!name.trim()) {
      setMessage({ type: "error", text: "Name is required." });
      setIsSubmitting(false);
      return;
    }
    if (name.trim().length < 3) {
      setMessage({
        type: "error",
        text: "Name must be at least 3 characters long.",
      });
      setIsSubmitting(false);
      return;
    }
    if (!surname.trim()) {
      setMessage({ type: "error", text: "Surname is required." });
      setIsSubmitting(false);
      return;
    }
    if (surname.trim().length < 4) {
      setMessage({
        type: "error",
        text: "Surname must be at least 4 characters long.",
      });
      setIsSubmitting(false);
      return;
    }
    if (!specialization.trim()) {
      setMessage({ type: "error", text: "Specialization is required." });
      setIsSubmitting(false);
      return;
    }
    if (!email.trim()) {
      setMessage({ type: "error", text: "Email is required." });
      setIsSubmitting(false);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage({
        type: "error",
        text: "Please enter a valid email address.",
      });
      setIsSubmitting(false);
      return;
    }
    if (!phone.trim()) {
      setMessage({ type: "error", text: "Phone number is required." });
      setIsSubmitting(false);
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      setMessage({
        type: "error",
        text: "Please enter a valid 10-digit phone number.",
      });
      setIsSubmitting(false);
      return;
    }
    if (!street.trim()) {
      setMessage({ type: "error", text: "Street is required." });
      setIsSubmitting(false);
      return;
    }
    if (!city.trim()) {
      setMessage({ type: "error", text: "City is required." });
      setIsSubmitting(false);
      return;
    }
    if (!state.trim()) {
      setMessage({ type: "error", text: "State is required." });
      setIsSubmitting(false);
      return;
    }
    if (!zipCode.trim()) {
      setMessage({ type: "error", text: "Zip Code is required." });
      setIsSubmitting(false);
      return;
    }
    if (!country.trim()) {
      setMessage({ type: "error", text: "Country is required." });
      setIsSubmitting(false);
      return;
    }
    if (!dateOfBirth) {
      setMessage({ type: "error", text: "Date of Birth is required." });
      setIsSubmitting(false);
      return;
    }
    if (isNaN(new Date(dateOfBirth).getTime())) {
      setMessage({ type: "error", text: "Invalid Date of Birth format." });
      setIsSubmitting(false);
      return;
    }
    if (!gender) {
      setMessage({ type: "error", text: "Gender is required." });
      setIsSubmitting(false);
      return;
    }

    // Assemble the payload with all fields, INCLUDING email
    const payload = {
      name,
      surname,
      email, // Include email in the payload
      specialization,
      phone,
      address: {
        street,
        city,
        state,
        zipCode,
        country,
      },
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : "",
      gender,
    };

    try {
      // Submit to the /api/doctors/profile-update endpoint
      const response = await fetch("/api/doctors/profile-update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        await update(); // Tell NextAuth to refresh session data on the client side
      } else {
        setMessage({
          type: "error",
          text:
            data.message ||
            "Failed to update profile. Please check your inputs.",
        });
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setMessage({
        type: "error",
        text: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = () => {
    // FIX: Ensure this path precisely matches your file system structure
    router.push("/doctor/profile/change-password");
  };

  // --- Render Loading/Error/Access Denied States ---
  if (status === "loading" || loadingProfile) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600 text-lg">Loading profile data...</p>
      </div>
    );
  }

  if (status === "authenticated" && session?.user?.role !== "doctor") {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-gray-100">
        <p className="text-red-600 text-lg">Access Denied.</p>
        <button
          onClick={() => router.replace("/login")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <div className="flex flex-1">
        <DoctorSidebar />
        <main className="flex-1 p-8 flex flex-col items-center">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-4xl">
            <h1 className="text-4xl font-bold text-blue-900 mb-8 text-center">
              Doctor Profile
            </h1>

            {/* Error and Success Messages */}
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
                  id="name"
                  type="text"
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
                  id="surname"
                  type="text"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800"
                  required
                />
              </div>

              {/* Email (now mutable) */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-gray-700 text-lg font-semibold mb-2"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} // Added onChange handler
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800"
                  required // Email is required
                />
              </div>

              {/* Specialization */}
              <div>
                <label
                  htmlFor="specialization"
                  className="block text-gray-700 text-lg font-semibold mb-2"
                >
                  Specialization
                </label>
                <input
                  id="specialization"
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800"
                  required
                />
              </div>

              {/* Phone Number */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-gray-700 text-lg font-semibold mb-2"
                >
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800"
                  required
                />
              </div>

              {/* Address Fields (Nested) */}
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
                    id="street"
                    type="text"
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
                    id="city"
                    type="text"
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
                    id="state"
                    type="text"
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
                    id="zipCode"
                    type="text"
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
                    id="country"
                    type="text"
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
                  id="dateOfBirth"
                  type="date"
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
                  value={gender}
                  onChange={(e) =>
                    setGender(e.target.value as "Male" | "Female" | "")
                  }
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
                  value={session?.user?.role || "N/A"}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed text-gray-700"
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    // Reset to original fetched values
                    if (session?.user) {
                      setName(session.user.name || "");
                      setSurname(session.user.surname || "");
                      setEmail(session.user.email || "");
                      setSpecialization(
                        (session.user as any)?.specialization || ""
                      );
                      setPhone(session.user.phone || "");
                      setStreet(session.user.address?.street || "");
                      setCity(session.user.address?.city || "");
                      setState(session.user.address?.state || "");
                      setZipCode(session.user.address?.zipCode || "");
                      setCountry(session.user.address?.country || "");
                      setDateOfBirth(
                        formatDateForInput(
                          session.user.dateOfBirth ?? undefined
                        )
                      );
                      setGender(
                        (session.user.gender || "") as "Male" | "Female" | ""
                      );
                    }
                    setMessage(null);
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-300 transition-colors duration-200 shadow-md"
                  disabled={isSubmitting}
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-700 text-white font-semibold rounded-full hover:bg-blue-800 transition-colors duration-200 shadow-lg transform hover:scale-105"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>

            {/* Change Password Section */}
            <div className="mt-10 pt-6 border-t border-gray-200 text-center">
              <h2 className="text-2xl font-bold text-blue-900 mb-4">
                Change Password
              </h2>
              <p className="text-gray-700 mb-4">
                You can update your account password here for enhanced security.
              </p>
              <button
                type="button" // Important: set type="button" to prevent form submission
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
