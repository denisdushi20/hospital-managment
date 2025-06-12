// pages/api/patients/[id].ts
import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/mongodb";
import Patient from "@/models/Patient";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]"; // Adjust path if needed
import mongoose from "mongoose";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  const { id } = req.query; // Patient ID from the URL
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== "admin") {
    return res
      .status(403)
      .json({
        message: "Forbidden: You must be an admin to perform this action.",
      });
  }

  if (!mongoose.Types.ObjectId.isValid(id as string)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Patient ID format." });
  }

  switch (req.method) {
    case "PUT": // For full update
    case "PATCH": // For partial update
      try {
        const { name, surname, email, phone, address, dateOfBirth, gender } =
          req.body;

        // Prepare update data, exclude role/password for this route
        const updateData: any = {
          name,
          surname,
          email,
          phone,
          address,
          gender,
        };
        if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);

        // Find patient and update, ensuring password and role are not accidentally changed here
        const patient = await Patient.findByIdAndUpdate(
          id,
          { $set: updateData }, // Use $set to only update provided fields
          { new: true, runValidators: true } // Return the updated document, run Mongoose validators
        ).select("-password"); // Exclude password from the returned document

        if (!patient) {
          return res
            .status(404)
            .json({ success: false, message: "Patient not found" });
        }

        return res.status(200).json({ success: true, data: patient });
      } catch (error) {
        console.error("Error updating patient:", error);
        if (error instanceof mongoose.Error.ValidationError) {
          const messages = Object.values(error.errors).map(
            (err) => (err as any).message
          );
          return res
            .status(400)
            .json({ message: "Validation failed", errors: messages });
        }
        if ((error as any).code === 11000) {
          // Duplicate key error
          return res
            .status(409)
            .json({ message: "Email already in use by another patient." });
        }
        return res
          .status(500)
          .json({
            success: false,
            message: "Internal server error",
            error: (error as Error).message,
          });
      }

    case "DELETE":
      try {
        const deletedPatient = await Patient.findByIdAndDelete(id);

        if (!deletedPatient) {
          return res
            .status(404)
            .json({ success: false, message: "Patient not found" });
        }

        return res
          .status(200)
          .json({ success: true, message: "Patient deleted successfully" });
      } catch (error) {
        console.error("Error deleting patient:", error);
        return res
          .status(500)
          .json({
            success: false,
            message: "Internal server error",
            error: (error as Error).message,
          });
      }

    default:
      res.setHeader("Allow", ["PUT", "PATCH", "DELETE"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
