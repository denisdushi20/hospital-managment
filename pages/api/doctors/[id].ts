// pages/api/doctors/[id].ts

import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/mongodb"; // Your database connection utility
import Doctor from "@/models/Doctor"; // Your Mongoose Doctor model
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]"; // Path to your NextAuth options

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

  const {
    query: { id },
    method,
  } = req;

  // Validate if id is a valid MongoDB ObjectId if you are using Mongoose's ObjectId
  // This helps prevent casting errors for invalid IDs
  // if (!id || typeof id !== 'string' || !/^[0-9a-fA-F]{24}$/.test(id as string)) {
  //   return res.status(400).json({ success: false, error: "Invalid Doctor ID" });
  // }

  switch (method) {
    case "GET":
      try {
        // Logic to find a doctor by ID from the database
        const doctor = await Doctor.findById(id);

        if (!doctor) {
          return res
            .status(404)
            .json({ success: false, error: "Doctor not found" });
        }
        res.status(200).json({ success: true, data: doctor });
      } catch (error) {
        console.error("Error fetching doctor:", error);
        res
          .status(500)
          .json({ success: false, error: "Failed to fetch doctor" });
      }
      break;

    case "PUT": // For full replacement of resource
    case "PATCH": // For partial update of resource
      try {
        const updateData = req.body;

        // Optionally, prevent updating sensitive fields like password directly here
        // If password needs to be updated, it should go through a dedicated change-password endpoint
        if (updateData.password) {
          delete updateData.password; // Or handle it via the change-password API
        }

        // Logic to find and update a doctor by ID
        const doctor = await Doctor.findByIdAndUpdate(id, updateData, {
          new: true, // Return the updated document
          runValidators: true, // Run schema validators on update
        });

        if (!doctor) {
          return res
            .status(404)
            .json({ success: false, error: "Doctor not found" });
        }
        res.status(200).json({ success: true, data: doctor });
      } catch (error: any) {
        console.error("Error updating doctor:", error);
        if (error.name === "ValidationError") {
          const messages = Object.values(error.errors).map(
            (val: any) => val.message
          );
          return res
            .status(400)
            .json({ success: false, error: messages.join(", ") });
        }
        res
          .status(400)
          .json({ success: false, error: "Failed to update doctor" });
      }
      break;

    case "DELETE":
      try {
        // Logic to find and delete a doctor by ID
        const deletedDoctor = await Doctor.deleteOne({ _id: id });

        if (deletedDoctor.deletedCount === 0) {
          // Check if a document was actually deleted
          return res
            .status(404)
            .json({ success: false, error: "Doctor not found" });
        }
        res.status(200).json({ success: true, data: {} }); // Return empty object or confirmation
      } catch (error) {
        console.error("Error deleting doctor:", error);
        res
          .status(500)
          .json({ success: false, error: "Failed to delete doctor" });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "PUT", "PATCH", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
