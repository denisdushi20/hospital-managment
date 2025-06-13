// // components/Modals/DoctorEditModal.tsx
// 'use client'; // This component uses client-side hooks and features

// import { useState, useEffect, FormEvent } from "react";
// import { toast } from "react-toastify";

// // Define the Doctor interface (matching the schema provided)
// interface Doctor {
//   _id: string;
//   name: string;
//   surname: string;
//   specialization: string;
//   email: string;
//   phone: string;
//   address: {
//     street: string;
//     city: string;
//     state: string;
//     zipCode: string;
//     country: string;
//   };
//   dateOfBirth: string; // Stored as ISO string (e.g., '2023-01-15T00:00:00.000Z')
//   gender: string; // "Male" or "Female"
//   role: string; // "doctor"
//   lastLogin?: string; // Optional field
//   createdAt: string;
//   updatedAt: string;
// }

// interface DoctorEditModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   doctor: Doctor;
//   onUpdate: (updatedDoctor: Doctor) => Promise<void>; // Assuming onUpdate is async
// }

// export default function DoctorEditModal({
//   isOpen,
//   onClose,
//   doctor,
//   onUpdate,
// }: DoctorEditModalProps) {
//   const [formData, setFormData] = useState<Doctor>({
//     ...doctor,
//     dateOfBirth: doctor.dateOfBirth ? new Date(doctor.dateOfBirth).toISOString().split('T')[0] : '',
//   });
  
//   const [message, setMessage] = useState<{ type: string; text: string } | null>(
//     null
//   );
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   useEffect(() => {
//     // Reset form data and messages when the modal is opened or a different doctor is loaded
//     setFormData({
//       ...doctor,
//       dateOfBirth: doctor.dateOfBirth ? new Date(doctor.dateOfBirth).toISOString().split('T')[0] : '',
//     });
//     setMessage(null);
//   }, [doctor, isOpen]);

//   // Effect to manage body overflow when modal is open/closed (prevents background scrolling)
//   useEffect(() => {
//     if (isOpen) {
//       document.body.style.overflow = "hidden";
//     } else {
//       document.body.style.overflow = "";
//     }
//     // Cleanup function to restore original overflow style when component unmounts
//     return () => {
//       document.body.style.overflow = "";
//     };
//   }, [isOpen]);

//   if (!isOpen) return null; // Don't render the modal content if it's not open

//   const handleChange = (
//     e: React.ChangeEvent<
//       HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
//     >
//   ) => {
//     const { name, value } = e.target;

//     // Handle nested address fields using dot notation in name attribute (e.g., "address.street")
//     if (name.startsWith("address.")) {
//       const addressField = name.split(".")[1] as keyof Doctor['address']; // Type assertion for nested key
//       setFormData((prev) => ({
//         ...prev,
//         address: {
//           ...prev.address,
//           [addressField]: value,
//         },
//       }));
//     } else {
//       setFormData((prev) => ({ ...prev, [name as keyof Doctor]: value })); // Type assertion for top-level key
//     }
//   };

//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     setMessage(null);

//     // Basic client-side validation
//     if (
//       !formData.name ||
//       !formData.surname ||
//       !formData.email ||
//       !formData.phone ||
//       !formData.specialization ||
//       !formData.address.street ||
//       !formData.address.city ||
//       !formData.address.state ||
//       !formData.address.zipCode ||
//       !formData.address.country ||
//       !formData.dateOfBirth ||
//       !formData.gender
//     ) {
//       setMessage({ type: "error", text: "Please fill all required fields." });
//       setIsSubmitting(false);
//       return;
//     }

//     try {
//       // Prepare data for API call: convert dateOfBirth back to ISO string for consistency with backend schema
//       const updatedDoctorData = {
//         ...formData,
//         dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : '',
//       };

//       await onUpdate(updatedDoctorData); // Call the `onUpdate` prop to handle the API call in the parent
//     } catch (error: any) { // Catch potential errors from the `onUpdate` function
//       console.error("Error in modal update handler:", error);
//       setMessage({
//         type: "error",
//         text: error.message || "Failed to update doctor profile. Please try again.",
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4 overflow-y-auto">
//       <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg mx-auto flex flex-col max-h-[90vh]">
//         <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 flex-shrink-0">
//           <h2 className="text-2xl font-semibold text-gray-800">
//             Add Doctor
//           </h2>
//           <button
//             type="button"
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
//             aria-label="Close"
//           >
//             <svg
//               className="h-6 w-6"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M6 18L18 6M6 6l12 12"
//               />
//             </svg>
//           </button>
//         </div>

//         {message && (
//           <div
//             className={`p-3 mx-6 mt-4 rounded-md text-sm ${
//               message.type === "success"
//                 ? "bg-green-100 text-green-700"
//                 : "bg-red-100 text-red-700"
//             }`}
//           >
//             {message.text}
//           </div>
//         )}

//         <form
//           id="doctorEditForm" 
//           onSubmit={handleSubmit}
//           className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 overflow-y-auto flex-grow"
//         >
//           {/* Doctor Details */}
//           <div>
//             <label
//               htmlFor="name"
//               className="block text-sm font-medium text-gray-700 mb-1"
//             >
//               Name
//             </label>
//             <input
//               type="text"
//               id="name"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//               required
//               spellCheck="false" // Added to prevent browser interference
//               autoCorrect="off" // Added for mobile devices
//               autoCapitalize="off" // Added for mobile devices
//             />
//           </div>
//           <div>
//             <label
//               htmlFor="surname"
//               className="block text-sm font-medium text-gray-700 mb-1"
//             >
//               Surname
//             </label>
//             <input
//               type="text"
//               id="surname"
//               name="surname"
//               value={formData.surname}
//               onChange={handleChange}
//               className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//               required
//               spellCheck="false"
//               autoCorrect="off"
//               autoCapitalize="off"
//             />
//           </div>
//           <div className="sm:col-span-2">
//             <label
//               htmlFor="specialization"
//               className="block text-sm font-medium text-gray-700 mb-1"
//             >
//               Specialization
//             </label>
//             <input
//               type="text"
//               id="specialization"
//               name="specialization"
//               value={formData.specialization}
//               onChange={handleChange}
//               className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//               required
//               spellCheck="false"
//               autoCorrect="off"
//               autoCapitalize="off"
//             />
//           </div>
//           <div>
//             <label
//               htmlFor="email"
//               className="block text-sm font-medium text-gray-700 mb-1"
//             >
//               Email
//             </label>
//             <input
//               type="email"
//               id="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//               required
//               // readOnly attribute is explicitly removed
//               spellCheck="false" // Added to prevent spell check interference
//               autoCorrect="off" // Added for mobile devices
//               autoCapitalize="off" // Added for mobile devices
//             />
//           </div>
//           <div>
//             <label
//               htmlFor="phone"
//               className="block text-sm font-medium text-gray-700 mb-1"
//             >
//               Phone
//             </label>
//             <input
//               type="tel"
//               id="phone"
//               name="phone"
//               value={formData.phone}
//               onChange={handleChange}
//               className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//               required
//               spellCheck="false"
//               autoCorrect="off"
//               autoCapitalize="off"
//             />
//           </div>

//           {/* Date of Birth and Gender */}
//           <div>
//             <label
//               htmlFor="dateOfBirth"
//               className="block text-sm font-medium text-gray-700 mb-1"
//             >
//               Date of Birth
//             </label>
//             <input
//               type="date"
//               id="dateOfBirth"
//               name="dateOfBirth"
//               value={formData.dateOfBirth}
//               onChange={handleChange}
//               className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//               required
//             />
//           </div>
//           <div>
//             <label
//               htmlFor="gender"
//               className="block text-sm font-medium text-gray-700 mb-1"
//             >
//               Gender
//             </label>
//             <select
//               id="gender"
//               name="gender"
//               value={formData.gender}
//               onChange={handleChange}
//               className="mt-1 block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm text-gray-900"
//               required
//             >
//               <option value="">Select Gender</option>
//               <option value="Male">Male</option>
//               <option value="Female">Female</option>
//             </select>
//           </div>

//           {/* Address fields */}
//           <div className="sm:col-span-2 space-y-3">
//             <h3 className="text-lg font-semibold text-gray-800">Address</h3>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
//               <div>
//                 <label
//                   htmlFor="address.street"
//                   className="block text-sm font-medium text-gray-700 mb-1"
//                 >
//                   Street
//                 </label>
//                 <input
//                   type="text"
//                   id="address.street"
//                   name="address.street"
//                   value={formData.address.street}
//                   onChange={handleChange}
//                   className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                   required
//                   spellCheck="false"
//                   autoCorrect="off"
//                   autoCapitalize="off"
//                 />
//               </div>
//               <div>
//                 <label
//                   htmlFor="address.city"
//                   className="block text-sm font-medium text-gray-700 mb-1"
//                 >
//                   City
//                 </label>
//                 <input
//                   type="text"
//                   id="address.city"
//                   name="address.city"
//                   value={formData.address.city}
//                   onChange={handleChange}
//                   className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                   required
//                   spellCheck="false"
//                   autoCorrect="off"
//                   autoCapitalize="off"
//                 />
//               </div>
//               <div>
//                 <label
//                   htmlFor="address.state"
//                   className="block text-sm font-medium text-gray-700 mb-1"
//                 >
//                   State
//                 </label>
//                 <input
//                   type="text"
//                   id="address.state"
//                   name="address.state"
//                   value={formData.address.state}
//                   onChange={handleChange}
//                   className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                   required
//                   spellCheck="false"
//                   autoCorrect="off"
//                   autoCapitalize="off"
//                 />
//               </div>
//               <div>
//                 <label
//                   htmlFor="address.zipCode"
//                   className="block text-sm font-medium text-gray-700 mb-1"
//                 >
//                   Zip Code
//                 </label>
//                 <input
//                   type="text"
//                   id="address.zipCode"
//                   name="address.zipCode"
//                   value={formData.address.zipCode}
//                   onChange={handleChange}
//                   className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                   required
//                   spellCheck="false"
//                   autoCorrect="off"
//                   autoCapitalize="off"
//                 />
//               </div>
//               <div className="sm:col-span-2">
//                 <label
//                   htmlFor="address.country"
//                   className="block text-sm font-medium text-gray-700 mb-1"
//                 >
//                   Country
//                 </label>
//                 <input
//                   type="text"
//                   id="address.country"
//                   name="address.country"
//                   value={formData.address.country}
//                   onChange={handleChange}
//                   className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                   required
//                   spellCheck="false"
//                   autoCorrect="off"
//                   autoCapitalize="off"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Role (Read-only) */}
//           <div className="sm:col-span-2">
//             <label
//               htmlFor="role"
//               className="block text-sm font-medium text-gray-700 mb-1"
//             >
//               Role
//             </label>
//             <input
//               type="text"
//               id="role"
//               name="role"
//               value={formData.role}
//               readOnly
//               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed sm:text-sm text-gray-900"
//             />
//           </div>
//         </form>
//         <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200 mt-auto flex-shrink-0">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-5 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               form="doctorEditForm"
//               disabled={isSubmitting}
//               className="inline-flex justify-center py-2 px-5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {isSubmitting ? "Updating..." : "Update Doctor"}
//             </button>
//           </div>
//       </div>
//     </div>
//   );
// }