// pages/api/doctors/index.ts

import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/mongodb"; // Your database connection utility
import Doctor from "@/models/Doctor"; // Your Mongoose Doctor model
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]"; // Path to your NextAuth options
import bcrypt from "bcryptjs"; // For password hashing

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check for authenticated session and admin role
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user?.role !== "admin") {
    // Assuming your session user object has a 'role' property
    return res
      .status(401)
      .json({ success: false, error: "Unauthorized: Admin access required" });
  }

  await dbConnect(); // Connect to your database

  switch (req.method) {
    case "GET":
      try {
        // Fetch all doctors from your database
        const doctors = await Doctor.find({});
        // Return doctors (Mongoose documents will have _id, not 'id' by default)
        res.status(200).json({ success: true, data: doctors });
      } catch (error) {
        console.error("Error fetching doctors:", error);
        res
          .status(500)
          .json({ success: false, error: "Failed to fetch doctors" });
      }
      break;

    case "POST":
      try {
        const newDoctorData = req.body;

        // Basic validation for required fields before proceeding
        if (
          !newDoctorData.name ||
          !newDoctorData.surname ||
          !newDoctorData.email ||
          !newDoctorData.password || // Password is required for new doctor
          !newDoctorData.phone ||
          !newDoctorData.address?.street ||
          !newDoctorData.address?.city ||
          !newDoctorData.address?.state ||
          !newDoctorData.address?.zipCode ||
          !newDoctorData.address?.country ||
          !newDoctorData.dateOfBirth ||
          !newDoctorData.gender
        ) {
          return res
            .status(400)
            .json({ success: false, error: "Missing required fields" });
        }

        // Hash the password before creating the doctor
        const hashedPassword = await bcrypt.hash(newDoctorData.password, 10); // 10 salt rounds recommended

        // Overwrite the plain text password with the hashed one
        newDoctorData.password = hashedPassword;

        // Ensure role is 'doctor' for new doctor creation through this admin panel
        newDoctorData.role = "doctor";

        // Create a new doctor in your database
        const doctor = await Doctor.create(newDoctorData);

        // Respond with the created doctor (excluding sensitive info like password)
        // You might want to strip the password field before sending the response
        const { password, ...safeDoctorData } = doctor.toObject(); // Convert Mongoose doc to plain object
        res.status(201).json({ success: true, data: safeDoctorData });
      } catch (error: any) {
        console.error("Error creating doctor:", error);
        // Handle Mongoose validation errors specifically if needed
        if (error.name === "ValidationError") {
          const messages = Object.values(error.errors).map(
            (val: any) => val.message
          );
          return res
            .status(400)
            .json({ success: false, error: messages.join(", ") });
        }
        if (error.code === 11000) {
          // Duplicate key error (e.g., email already exists)
          return res
            .status(400)
            .json({ success: false, error: "Email already registered." });
        }
        res
          .status(500)
          .json({ success: false, error: "Failed to create doctor" });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      break;
  }
}
