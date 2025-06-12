// pages/api/user/profile.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import dbConnect from "@/lib/mongodb";
import Patient from "@/models/Patient";
import { z } from "zod";

// Define Zod schema for input validation
const addressSchema = z
  .object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  })
  .partial();

const patientProfileSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  surname: z.string().min(1, "Surname is required").optional(),
  email: z.string().email("Invalid email address").optional(), // Email is now part of the schema
  phone: z.string().optional(),
  address: addressSchema.optional(),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
    .optional(),
  gender: z.enum(["Male", "Female", "Other", "Prefer not to say"]).optional(),
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

      const validationResult = patientProfileSchema.safeParse(body);

      if (!validationResult.success) {
        const errors = validationResult.error.errors.map((err: z.ZodIssue) => ({
          path: err.path.join("."),
          message: err.message,
        }));
        return res.status(400).json({ message: "Validation failed", errors });
      }

      const {
        name,
        surname,
        email, // Email is now destructured
        phone,
        address,
        dateOfBirth,
        gender,
      } = validationResult.data;

      const patient = await Patient.findById(userId);

      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      // Update fields (only if provided in the payload)
      if (name !== undefined) patient.name = name;
      if (surname !== undefined) patient.surname = surname;
      if (phone !== undefined) patient.phone = phone;

      // --- EMAIL UPDATE LOGIC WITH UNIQUENESS CHECK ---
      if (email !== undefined && email !== patient.email) {
        // Only proceed if a new email is provided and it's different from the current one
        const existingPatientWithEmail = await Patient.findOne({ email });

        // If an account with this email already exists AND it's not the current user's account
        if (
          existingPatientWithEmail &&
          existingPatientWithEmail._id.toString() !== userId
        ) {
          return res
            .status(409)
            .json({
              message: "This email is already in use by another account.",
            });
        }
        // If email is unique (or belongs to the current user), update it
        patient.email = email;
      }
      // --- END EMAIL UPDATE LOGIC ---

      if (address !== undefined) {
        patient.address = {
          ...patient.address,
          ...address,
        };
      }
      if (dateOfBirth !== undefined) {
        patient.dateOfBirth = new Date(dateOfBirth);
      }
      if (gender !== undefined) patient.gender = gender;

      await patient.save();

      const updatedPatient = patient.toObject();
      if (updatedPatient.dateOfBirth) {
        // Ensure dateOfBirth is an ISO string for consistent session update
        updatedPatient.dateOfBirth = updatedPatient.dateOfBirth.toISOString();
      }

      const userForSessionUpdate = {
        id: updatedPatient._id.toString(),
        name: updatedPatient.name,
        surname: updatedPatient.surname,
        email: updatedPatient.email,
        role: updatedPatient.role,
        phone: updatedPatient.phone,
        address: updatedPatient.address,
        dateOfBirth: updatedPatient.dateOfBirth,
        gender: updatedPatient.gender,
      };

      return res
        .status(200)
        .json({
          message: "Profile updated successfully",
          user: userForSessionUpdate,
        });
    } catch (error: any) {
      // Type 'any' for 'error' parameter to avoid TS7006
      console.error("Error updating patient profile:", error);
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  } else {
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
