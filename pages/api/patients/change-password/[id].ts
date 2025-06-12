// pages/api/patients/change-password/[id].ts
import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/mongodb";
import Patient from "@/models/Patient";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]"; // Adjust path if needed
import mongoose from "mongoose";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id } = req.query;
  const { newPassword } = req.body; // Admin just provides the new password
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== "admin") {
    return res
      .status(403)
      .json({
        message:
          "Forbidden: You must be an admin to change a patient's password.",
      });
  }

  if (!mongoose.Types.ObjectId.isValid(id as string)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Patient ID format." });
  }

  if (!newPassword || newPassword.length < 6) {
    // Basic password length validation
    return res
      .status(400)
      .json({
        success: false,
        message: "New password must be at least 6 characters long.",
      });
  }

  try {
    await dbConnect();

    const patient = await Patient.findById(id);
    if (!patient) {
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    patient.password = hashedPassword;
    await patient.save(); // Save the updated password

    return res
      .status(200)
      .json({
        success: true,
        message: "Patient password updated successfully.",
      });
  } catch (error) {
    console.error("Error changing patient password:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Internal server error",
        error: (error as Error).message,
      });
  }
}
