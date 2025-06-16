// pages/api/appointments/[id].ts
// This API route handles fetching, updating (PUT/PATCH), and deleting (DELETE) a single appointment by ID.
// Access control is based on user roles:
// - Admin: Can view, update, and delete ANY appointment.
// - Doctor: Denied update/delete access (can only view their own via /api/appointments).
// - Patient: Denied update/delete access (can only view their own via /api/appointments, can create via POST to /api/appointments).

import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/mongodb";
import Appointment from "@/models/Appointment"; // Your Mongoose Appointment model
import Doctor from "@/models/Doctor"; // For validating doctorId if changed
import Patient from "@/models/Patient"; // For validating patientId if changed
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import mongoose from "mongoose"; // For ObjectId validation

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  const userRole = session?.user?.role;
  const userId = session?.user?.id; // The ID of the currently logged-in user

  await dbConnect(); // Connect to your database

  const {
    query: { id }, // Extract the appointment ID from the URL
    method,
  } = req;

  // Validate the incoming appointment ID format
  if (!id || typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
    console.warn(
      "API /appointments/[id]: Invalid or missing appointment ID in URL."
    );
    return res
      .status(400)
      .json({ success: false, error: "Invalid or missing appointment ID." });
  }

  // --- Authorization Check (Early Exit) ---
  // Only admins are allowed to use this specific [id].ts route for PUT/PATCH/DELETE.
  // Doctors and patients can only GET their own appointments via the /api/appointments.ts route.
  if (!session || userRole !== "admin") {
    console.warn(
      `API /appointments/[id]: Unauthorized access attempt by role: ${
        userRole || "none"
      }.`
    );
    return res
      .status(403)
      .json({
        success: false,
        error:
          "Forbidden: Only administrators can modify or delete appointments directly.",
      });
  }

  try {
    switch (method) {
      case "PUT": // For full replacement update
      case "PATCH": // For partial update
        const { patient, doctor, date, time, reason, status, notes } = req.body;

        // Basic validation for required fields in the update payload
        if (!patient || !doctor || !date || !time || !reason || !status) {
          console.warn(
            "API /appointments/[id] (PUT/PATCH): Missing required fields in body.",
            req.body
          );
          return res
            .status(400)
            .json({
              success: false,
              error:
                "Missing required fields for update (patient, doctor, date, time, reason, status).",
            });
        }

        // Validate ObjectId formats for patient and doctor IDs
        if (
          !mongoose.Types.ObjectId.isValid(patient) ||
          !mongoose.Types.ObjectId.isValid(doctor)
        ) {
          console.warn(
            "API /appointments/[id] (PUT/PATCH): Invalid patient or doctor ID format."
          );
          return res
            .status(400)
            .json({
              success: false,
              error: "Invalid patient ID or doctor ID format.",
            });
        }

        // Check if patient and doctor actually exist
        const existingPatient = await Patient.findById(patient);
        if (!existingPatient) {
          console.warn(
            "API /appointments/[id] (PUT/PATCH): Patient not found with ID:",
            patient
          );
          return res
            .status(404)
            .json({ success: false, error: "Selected patient not found." });
        }

        const existingDoctor = await Doctor.findById(doctor);
        if (!existingDoctor) {
          console.warn(
            "API /appointments/[id] (PUT/PATCH): Doctor not found with ID:",
            doctor
          );
          return res
            .status(404)
            .json({ success: false, error: "Selected doctor not found." });
        }

        // Validate date (optional: check if in past if allowed to change past appointments)
        const appointmentDateTime = new Date(`${date}T${time}:00`);
        if (isNaN(appointmentDateTime.getTime())) {
          return res
            .status(400)
            .json({ success: false, error: "Invalid date or time format." });
        }
        // Example: If you want to prevent updating to a past date/time (admins might need to update past status)
        // if (appointmentDateTime < new Date()) {
        //   return res.status(400).json({ success: false, error: 'Cannot set appointment date/time to the past.' });
        // }

        // Construct the update object
        const updateFields = {
          patient,
          doctor,
          date: new Date(date), // Convert date string to Date object for MongoDB
          time,
          reason,
          status,
          notes: notes || undefined, // Ensure empty string becomes undefined for optional field
        };

        const updatedAppointment = await Appointment.findByIdAndUpdate(
          id, // The appointment ID from the URL query
          updateFields,
          {
            new: true, // Return the updated document
            runValidators: true, // Run schema validators on update
          }
        )
          .populate("patient", "name surname email") // Populate for the response
          .populate("doctor", "name surname specialization email"); // Populate for the response

        if (!updatedAppointment) {
          console.warn(
            "API /appointments/[id] (PUT/PATCH): Appointment not found for ID:",
            id
          );
          return res
            .status(404)
            .json({ success: false, error: "Appointment not found." });
        }

        res
          .status(200)
          .json({
            success: true,
            data: updatedAppointment,
            message: "Appointment updated successfully!",
          });
        break;

      case "DELETE":
        const deletedAppointment = await Appointment.findByIdAndDelete(id);

        if (!deletedAppointment) {
          console.warn(
            "API /appointments/[id] (DELETE): Appointment not found for ID:",
            id
          );
          return res
            .status(404)
            .json({ success: false, error: "Appointment not found." });
        }

        res
          .status(200)
          .json({
            success: true,
            message: "Appointment deleted successfully!",
          });
        break;

      default:
        res.setHeader("Allow", ["PUT", "PATCH", "DELETE"]);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error: any) {
    console.error(`Error in /api/appointments/[id] (${method}):`, error);
    // Handle Mongoose validation errors
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
      .json({
        success: false,
        error: error.message || "Failed to perform operation on appointment.",
      });
  }
}
