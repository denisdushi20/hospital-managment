// pages/api/doctors/profile-update/change-password/index.ts
// This API route is specifically for a logged-in doctor to change THEIR OWN password.

import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]"; // Adjust path if needed
import dbConnect from "@/lib/mongodb"; // Your database connection utility
import Doctor from "@/models/Doctor"; // Your Mongoose Doctor model
import bcrypt from "bcryptjs"; // For password hashing and comparison
import mongoose from "mongoose";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow PUT requests for changing password
  if (req.method !== "PUT") {
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const session = await getServerSession(req, res, authOptions);
  // --- DEBUGGING LOG ---
  console.log(
    "API /doctors/profile-update/change-password: Session:",
    session
      ? { userId: session.user?.id, role: session.user?.role }
      : "No Session"
  );

  // 1. Authentication and Authorization Check: Ensure logged-in user is a 'doctor'
  if (
    !session ||
    !session.user ||
    session.user.role !== "doctor" ||
    !session.user.id
  ) {
    console.warn(
      "API /doctors/profile-update/change-password: Unauthorized access attempt. Session:",
      session
    );
    return res
      .status(401)
      .json({
        success: false,
        message: "Unauthorized: Doctor access required.",
      });
  }

  await dbConnect(); // Connect to MongoDB

  const doctorId = session.user.id; // Get doctor's ID from the session (NOT from request body or URL)
  const { currentPassword, newPassword } = req.body;

  // --- DEBUGGING LOGS ---
  console.log(
    "API /doctors/profile-update/change-password: Doctor ID from session:",
    doctorId
  );
  console.log(
    "API /doctors/profile-update/change-password: Received newPassword length:",
    newPassword?.length
  );
  // WARNING: Do NOT log currentPassword or newPassword directly for security reasons!

  // 2. Validate request body and ID format
  if (!currentPassword || !newPassword) {
    console.error(
      "API /doctors/profile-update/change-password: Missing current or new password."
    );
    return res
      .status(400)
      .json({
        success: false,
        message: "Current password and new password are required.",
      });
  }

  // Basic new password strength validation (matching frontend)
  if (newPassword.length < 6) {
    console.error(
      "API /doctors/profile-update/change-password: New password too short."
    );
    return res
      .status(400)
      .json({
        success: false,
        message: "New password must be at least 6 characters long.",
      });
  }

  if (!mongoose.Types.ObjectId.isValid(doctorId)) {
    console.error(
      "API /doctors/profile-update/change-password: Invalid doctor ID format from session:",
      doctorId
    );
    return res
      .status(400)
      .json({
        success: false,
        message: "Invalid doctor ID format in session.",
      });
  }

  try {
    // 3. Find the doctor by their ID from the session
    // IMPORTANT: Explicitly select the 'password' field to retrieve it from the database.
    // If your Doctor model has `select: false` on the password field, this is crucial.
    const doctor = await Doctor.findById(doctorId).select("+password");

    if (!doctor) {
      console.warn(
        "API /doctors/profile-update/change-password: Doctor not found for ID:",
        doctorId
      );
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found." });
    }

    // --- DEBUGGING LOG ---
    // This tells you if the password field was actually populated from the DB
    console.log(
      "API /doctors/profile-update/change-password: Doctor found. Password field exists:",
      !!doctor.password
    );

    // 4. Verify the current password provided by the user
    // Make sure 'doctor.password' actually contains the hashed password from the DB
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      doctor.password
    );
    // --- DEBUGGING LOG ---
    console.log(
      "API /doctors/profile-update/change-password: bcrypt.compare result (isPasswordValid):",
      isPasswordValid
    );

    if (!isPasswordValid) {
      console.warn(
        "API /doctors/profile-update/change-password: Incorrect current password provided for doctor ID:",
        doctorId
      );
      return res
        .status(401)
        .json({ success: false, message: "Incorrect current password." });
    }

    // 5. Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10); // 10 salt rounds recommended for bcrypt
    console.log(
      "API /doctors/profile-update/change-password: New password hashed."
    );

    // 6. Update the doctor's password in the database
    doctor.password = hashedPassword;
    await doctor.save(); // Save the updated doctor document
    console.log(
      "API /doctors/profile-update/change-password: Password successfully saved for doctor ID:",
      doctorId
    );

    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully." });
  } catch (error: any) {
    console.error(
      "API /doctors/profile-update/change-password: Error changing password:",
      error
    );
    // Handle Mongoose validation errors or other specific errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(
        (val: any) => val.message
      );
      console.error(
        "API /doctors/profile-update/change-password: Validation error:",
        messages.join(", ")
      );
      return res
        .status(400)
        .json({ success: false, message: messages.join(", ") });
    }
    // General error fallback
    return res
      .status(500)
      .json({
        success: false,
        message: error.message || "Internal server error.",
      });
  }
}
