// pages/api/doctors/change-password/[id].ts

import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/mongodb"; // Your database connection utility
import Doctor from "@/models/Doctor"; // Your Mongoose Doctor model
import bcrypt from "bcryptjs"; // For hashing passwords
import { getServerSession } from "next-auth";
import { authOptions } from "../../../api/auth/[...nextauth]"; // Adjust path as needed

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check for authenticated session and admin role
  const session = await getServerSession(req, res, authOptions);

  if (
    !session ||
    (session.user?.role !== "admin" && session.user?.role !== "doctor")
  ) {
    // Assuming your session user object has a 'role' property
    return res.status(401).json({
      success: false,
      error: "Unauthorized: Admin access required to change doctor password",
    });
  }

  await dbConnect(); // Connect to your database

  const {
    query: { id },
    method,
  } = req;

  if (method !== "PUT" && method !== "PATCH") {
    res.setHeader("Allow", ["PUT", "PATCH"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  try {
    const { newPassword } = req.body;

    // Basic validation for new password
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: "New password must be at least 6 characters long",
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10); // 10 is the salt rounds, adjust as needed

    // Logic to find the doctor by ID and update their password
    const doctor = await Doctor.findByIdAndUpdate(
      id,
      { password: hashedPassword }, // Only update the password field
      {
        new: true, // Return the updated document
        runValidators: true, // Run schema validators (if any on password field)
      }
    );

    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, error: "Doctor not found" });
    }

    // You might want to omit sending the password back in the response
    const { password, ...safeDoctorData } = doctor.toObject();

    res
      .status(200)
      .json({
        success: true,
        message: "Doctor password updated successfully",
        data: safeDoctorData,
      });
  } catch (error: any) {
    console.error("Error updating doctor password:", error);
    // Handle Mongoose validation errors or other specific errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(
        (val: any) => val.message
      );
      return res
        .status(400)
        .json({ success: false, error: messages.join(", ") });
    }
    res
      .status(500)
      .json({ success: false, error: "Failed to update doctor password" });
  }
}
