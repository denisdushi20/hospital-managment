// pages/api/user/change-password.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import dbConnect from "@/lib/mongodb";
import Patient from "@/models/Patient"; 
import { z } from "zod";
import bcrypt from "bcryptjs"; // Import bcryptjs for password hashing/comparison

// Define Zod schema for input validation
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters long."),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user || session.user.role !== "patient") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = session.user.id;
  if (!userId) {
    return res.status(400).json({ message: "User ID not found in session" });
  }

  if (req.method === "PUT") {
    try {
      const body = req.body;
      const validationResult = changePasswordSchema.safeParse(body);

      if (!validationResult.success) {
        const errors = validationResult.error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }));
        return res.status(400).json({ message: "Validation failed", errors });
      }

      const { currentPassword, newPassword } = validationResult.data;

      const patient = await Patient.findById(userId);

      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      // Check if patient.password exists before comparing
      if (!patient.password) {
        return res.status(500).json({ message: "User has no password set." });
      }

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        patient.password
      );

      if (!isPasswordValid) {
        return res.status(401).json({ message: "Incorrect current password." });
      }

      // 2. Hash the new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // 3. Update the patient's password
      patient.password = hashedNewPassword;
      await patient.save();

      return res
        .status(200)
        .json({ message: "Password changed successfully." });
    } catch (error: any) {
      console.error("Error changing password:", error);
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  } else {
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
