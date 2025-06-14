// pages/api/doctors/profile-update/index.ts
// This API route is specifically for a logged-in doctor to manage their own profile.

import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
// IMPORTANT: Adjust this path if your authOptions file is located elsewhere
import { authOptions } from "@/pages/api/auth/[...nextauth]"; // Assuming authOptions is here
import dbConnect from "@/lib/mongodb"; // Your database connection utility (e.g., dbConnect.ts or mongodb.ts)
import Doctor from "@/models/Doctor"; // Your Mongoose Doctor model
import mongoose from "mongoose";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get the session to verify authentication and role
  const session = await getServerSession(req, res, authOptions);

  // 1. Authentication and Authorization Check
  if (
    !session ||
    !session.user ||
    session.user.role !== "doctor" ||
    !session.user.id
  ) {
    console.warn(
      `API /doctors/profile-update: Unauthorized access attempt. Role: ${session?.user?.role}`
    );
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Doctor access required.",
    });
  }

  await dbConnect(); // Connect to MongoDB
  const doctorId = session.user.id; // Get doctor's ID from the session

  // Validate Doctor ID format from session (crucial for Mongoose queries)
  if (!mongoose.Types.ObjectId.isValid(doctorId)) {
    console.error(
      "API /doctors/profile-update: Invalid doctor ID format from session:",
      doctorId
    );
    return res
      .status(400)
      .json({ success: false, message: "Invalid doctor ID format." });
  }

  switch (req.method) {
    case "GET":
      try {
        // Fetch the doctor's profile by their ID
        const doctor = await Doctor.findById(doctorId).select("-password -__v"); // Exclude password and version key

        if (!doctor) {
          console.warn(
            "API /doctors/profile-update: Doctor profile not found for ID:",
            doctorId
          );
          return res
            .status(404)
            .json({ success: false, message: "Doctor profile not found." });
        }

        return res.status(200).json({ success: true, data: doctor });
      } catch (error: any) {
        console.error(
          "API /doctors/profile-update (GET): Error fetching doctor profile:",
          error
        );
        return res.status(500).json({
          success: false,
          message: error.message || "Internal server error.",
        });
      }

    case "PUT":
      try {
        const body = req.body;
        console.log(
          "API /doctors/profile-update (PUT): Received body for update:",
          body
        );

        // Prepare update fields: Only include fields that are allowed to be updated.
        // Now including 'email' in the allowed update fields.
        // Exclude 'role', 'password' as they typically aren't updated via a self-profile form.
        const {
          name,
          surname,
          specialization,
          email, // <--- NOW INCLUDED FOR UPDATE
          phone,
          address, // address is a nested object
          dateOfBirth,
          gender,
        } = body;

        const updateFields: any = {};

        if (name !== undefined) updateFields.name = name;
        if (surname !== undefined) updateFields.surname = surname;
        if (specialization !== undefined)
          updateFields.specialization = specialization;
        if (email !== undefined) updateFields.email = email; // <--- ADDED EMAIL TO UPDATE FIELDS
        if (phone !== undefined) updateFields.phone = phone;
        if (gender !== undefined) updateFields.gender = gender;

        // Handle nested 'address' object updates
        if (address && typeof address === "object") {
          if (address.street !== undefined)
            updateFields["address.street"] = address.street;
          if (address.city !== undefined)
            updateFields["address.city"] = address.city;
          if (address.state !== undefined)
            updateFields["address.state"] = address.state;
          if (address.zipCode !== undefined)
            updateFields["address.zipCode"] = address.zipCode;
          if (address.country !== undefined)
            updateFields["address.country"] = address.country;
        }

        // Handle 'dateOfBirth': Convert the 'YYYY-MM-DD' string from the frontend to a Date object
        if (dateOfBirth !== undefined) {
          try {
            const parsedDate = new Date(dateOfBirth);
            if (isNaN(parsedDate.getTime())) {
              throw new Error("Invalid date format for Date of Birth.");
            }
            updateFields.dateOfBirth = parsedDate;
          } catch (e: any) {
            return res.status(400).json({
              success: false,
              message: e.message || "Invalid date format for Date of Birth.",
            });
          }
        }

        // Find and update the doctor document
        const updatedDoctor = await Doctor.findByIdAndUpdate(
          doctorId,
          { $set: updateFields }, // Use $set to update specific fields
          {
            new: true, // Return the updated document
            runValidators: true, // Run Mongoose schema validators on update
            select: "-password -__v", // Exclude password and version key from the response
          }
        );

        if (!updatedDoctor) {
          console.warn(
            "API /doctors/profile-update (PUT): Doctor not found or update failed for ID:",
            doctorId
          );
          return res.status(404).json({
            success: false,
            message: "Doctor not found or update failed.",
          });
        }

        return res.status(200).json({ success: true, data: updatedDoctor });
      } catch (error: any) {
        // Handle Mongoose validation errors
        if (error.name === "ValidationError") {
          const messages = Object.values(error.errors).map(
            (val: any) => val.message
          );
          console.error(
            "API /doctors/profile-update (PUT): Validation error:",
            messages.join(", ")
          );
          return res
            .status(400)
            .json({ success: false, message: messages.join(", ") });
        }
        // Handle duplicate key error for unique fields (like email)
        if (error.code === 11000) {
          console.error(
            "API /doctors/profile-update (PUT): Duplicate email error:",
            error.message
          );
          return res
            .status(400)
            .json({
              success: false,
              message:
                "Email already in use. Please use a different email address.",
            });
        }
        console.error(
          "API /doctors/profile-update (PUT): Error updating doctor profile:",
          error
        );
        return res.status(500).json({
          success: false,
          message: error.message || "Internal server error.",
        });
      }

    default:
      res.setHeader("Allow", ["GET", "PUT"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      break;
  }
}
