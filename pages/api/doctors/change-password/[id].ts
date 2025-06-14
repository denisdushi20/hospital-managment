// pages/api/doctors/change-password/[id].ts

import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/mongodb";
import Doctor from "@/models/Doctor"; 
import bcrypt from "bcryptjs"; 
import { getServerSession } from "next-auth";
import { authOptions } from "../../../api/auth/[...nextauth]"; 
import mongoose from "mongoose"; 

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  console.log(
    "API /doctors/change-password/[id]: Incoming session role:",
    session?.user?.role
  );

  // Initial authorization: Only allow 'admin' or 'doctor' roles
  if (
    !session ||
    (session.user?.role !== "admin" && session.user?.role !== "doctor")
  ) {
    console.warn(
      'Unauthorized access: User not authenticated or role is not "admin" or "doctor".'
    );
    return res
      .status(401)
      .json({
        success: false,
        error: "Unauthorized: Admin or Doctor access required.",
      });
  }

  await dbConnect();

  const {
    query: { id }, 
    method,
    body: { currentPassword, newPassword }, 
  } = req;


  if (method !== "PUT" && method !== "PATCH") {
    res.setHeader("Allow", ["PUT", "PATCH"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  let targetDoctorId: string; 


  if (session?.user?.role === "admin") {
    if (!id || typeof id !== "string") {
      console.error(
        "Admin password change: Missing or invalid doctor ID in URL."
      );
      return res
        .status(400)
        .json({
          success: false,
          error: "Doctor ID must be provided in the URL path for admin.",
        });
    }
    targetDoctorId = id; // Admin specifies the ID in the URL
    console.log(
      `Admin (${session.user.id}) attempting to change password for doctor ID: ${targetDoctorId}`
    );
    // For admin, currentPassword is NOT required.
  }
  // Case 2: User is a DOCTOR
  else if (session?.user?.role === "doctor") {
    // A doctor can only change their OWN password.
    // The ID from the URL must match their session ID, or be absent (implying self-update).
    if (!session.user.id || typeof session.user.id !== "string") {
      console.error(
        "Doctor password change: Session user ID missing or invalid."
      );
      return res
        .status(401)
        .json({
          success: false,
          error: "Unauthorized: User ID missing from session.",
        });
    }

    // Security check: If an ID is provided in the URL, it MUST match the session's user ID.
    // This prevents a logged-in doctor from trying to change another doctor's password by manipulating the URL.
    if (id && typeof id === "string" && id !== session.user.id) {
      console.warn(
        `Doctor (${session.user.id}) attempted to change password for a different ID (${id}). Forbidden.`
      );
      return res
        .status(403)
        .json({
          success: false,
          error: "Forbidden: You can only change your own password.",
        });
    }

    targetDoctorId = session.user.id; // Doctor's ID is always taken from their session for security
    console.log(
      `Doctor (${targetDoctorId}) attempting to change their own password.`
    );

    // For a doctor changing their own password, currentPassword IS REQUIRED
    if (!currentPassword) {
      console.error(
        "Doctor password change: Missing current password for self-update."
      );
      return res
        .status(400)
        .json({
          success: false,
          error: "Current password is required to change your password.",
        });
    }
  }
  // This 'else' block should technically not be reached due to the initial role check,
  // but it's a good fail-safe.
  else {
    console.warn("Unauthorized access: Role not handled after initial check.");
    return res
      .status(401)
      .json({ success: false, error: "Unauthorized access." });
  }

  // --- Common Validation for New Password ---
  if (
    !newPassword ||
    typeof newPassword !== "string" ||
    newPassword.length < 6
  ) {
    console.error(
      "New password validation: New password missing or too short."
    );
    return res.status(400).json({
      success: false,
      error: "New password must be at least 6 characters long",
    });
  }

  // Validate the MongoDB ObjectId format of the targetDoctorId
  // This helps prevent invalid ID errors before hitting the database
  if (!mongoose.Types.ObjectId.isValid(targetDoctorId)) {
    console.error(
      "Invalid MongoDB ID format for targetDoctorId:",
      targetDoctorId
    );
    return res
      .status(400)
      .json({ success: false, error: "Invalid doctor ID format." });
  }

  try {
    // Find the doctor document. Explicitly select the 'password' field if we need to compare it.
    // We only need the password if the current user is a 'doctor' (for currentPassword verification).
    const doctor = await Doctor.findById(targetDoctorId).select(
      session?.user?.role === "doctor" ? "+password" : ""
    );

    if (!doctor) {
      console.warn("Doctor not found for ID:", targetDoctorId);
      return res
        .status(404)
        .json({ success: false, error: "Doctor not found." });
    }

    // --- Current Password Verification (ONLY for doctors changing their own password) ---
    if (session?.user?.role === "doctor") {
      // Ensure the doctor object actually has a password field to compare against
      if (!doctor.password) {
        console.error(
          `Doctor ${targetDoctorId} has no password field in DB for comparison.`
        );
        // This is a server configuration error or data inconsistency
        return res
          .status(500)
          .json({
            success: false,
            error:
              "Server error: Cannot verify current password due to missing hash.",
          });
      }

      // Compare the provided currentPassword with the stored hashed password
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        doctor.password
      );
      console.log(
        `bcrypt.compare result for doctor ${targetDoctorId}: ${isPasswordValid}`
      );

      if (!isPasswordValid) {
        console.warn(
          `Doctor ${targetDoctorId} provided incorrect current password.`
        );
        // Return 401 Unauthorized because the provided current password is not valid
        return res
          .status(401)
          .json({ success: false, error: "Incorrect current password." });
      }
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10); // 10 is the salt rounds

    // Update the doctor's password
    // Using save() method to ensure pre-save hooks (if any, like pre-save hashing) are run.
    doctor.password = hashedPassword;
    await doctor.save();

    // Return success response, omitting the password field for security
    const { password: _, ...safeDoctorData } = doctor.toObject(); // Use `_` to discard the password variable

    res.status(200).json({
      success: true,
      message: "Doctor password updated successfully",
      data: safeDoctorData,
    });
  } catch (error: any) {
    console.error("Error updating doctor password:", error);
    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(
        (val: any) => val.message
      );
      return res
        .status(400)
        .json({ success: false, error: messages.join(", ") });
    }
    // Handle other errors
    res
      .status(500)
      .json({ success: false, error: "Failed to update doctor password" });
  }
}
