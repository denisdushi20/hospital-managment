// pages/api/appointments.ts

// This API route handles fetching (GET) and creating (POST) appointments.

// Access control is based on user roles:

// - Admin: Can view all appointments and create appointments.

// - Doctor: Can view only their own appointments.

// - Patient: Can view only their own appointments and create appointments.

import type { NextApiRequest, NextApiResponse } from "next";

import dbConnect from "@/lib/mongodb";

import Appointment from "@/models/Appointment"; // Your Mongoose Appointment model

import Doctor from "@/models/Doctor"; // Needed for validation or reference
import Patient from "@/models/Patient"; // Needed for validation or reference
import { getServerSession } from "next-auth";

import { authOptions } from "./auth/[...nextauth]"; // Adjust path as needed

import mongoose from "mongoose"; // For ObjectId validation

export default async function handler(
  req: NextApiRequest,

  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  const userRole = session?.user?.role;

  const userId = session?.user?.id; // The ID of the currently logged-in user

  await dbConnect();

  switch (req.method) {
    case "GET":
      try {
        let query: any = {}; // Base query, will be modified based on role

        let populateOptions: string[] = ["patient", "doctor"]; // Default to populate both // --- Role-based filtering for GET requests ---

        if (!session) {
          // If not authenticated, deny access

          return res
            .status(401)
            .json({
              success: false,
              error: "Unauthorized: Authentication required.",
            });
        }

        if (userRole === "admin") {
          // Admin can see all appointments

          console.log("Admin fetching all appointments.");

          query = {}; // No specific filter needed
        } else if (userRole === "doctor") {
          // Doctor can only see appointments assigned to them

          if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res
              .status(400)
              .json({ success: false, error: "Invalid doctor ID in session." });
          }

          query = { doctor: userId };

          console.log(`Doctor (${userId}) fetching their appointments.`);
        } else if (userRole === "patient") {
          // Patient can only see appointments they made

          if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res
              .status(400)
              .json({
                success: false,
                error: "Invalid patient ID in session.",
              });
          }

          query = { patient: userId };

          console.log(`Patient (${userId}) fetching their appointments.`);
        } else {
          // Any other role, or if role is missing/invalid after auth, deny access

          console.warn("GET Appointments: User role not authorized:", userRole);

          return res
            .status(403)
            .json({
              success: false,
              error: "Forbidden: Insufficient permissions.",
            });
        } // Fetch appointments and populate patient/doctor details

        const appointments = await Appointment.find(query)

          .populate("patient", "name surname email") // Selects only name, surname, email from patient

          .populate("doctor", "name surname specialization email") // Selects relevant fields from doctor

          .sort({ date: 1, time: 1 }); // Sort by date then time for chronological order

        res.status(200).json({ success: true, data: appointments });
      } catch (error: any) {
        console.error("Error fetching appointments:", error);

        res
          .status(500)
          .json({
            success: false,
            error: error.message || "Failed to fetch appointments.",
          });
      }

      break;

    case "POST":
      try {
        // --- Authorization for POST request ---

        if (!session || userRole !== "patient") {
          console.warn(
            "POST Appointment: Unauthorized attempt. User role:",
            userRole
          );

          return res
            .status(403)
            .json({
              success: false,
              error: "Forbidden: Only patients can book appointments.",
            });
        }

        const {
          doctorId,
          patientId,
          date,
          time,
          reason,
          notes,
          status: apptStatus,
        } = req.body; // --- Input Validation ---

        if (!doctorId || !patientId || !date || !time || !reason) {
          console.error("POST Appointment: Missing required fields.");

          return res
            .status(400)
            .json({
              success: false,
              error:
                "Missing required fields: doctorId, patientId, date, time, reason.",
            });
        } // Verify that the patientId from the request body matches the logged-in patient's ID

        if (patientId !== userId) {
          console.warn(
            `POST Appointment: Mismatch patientId in body (${patientId}) and session (${userId}).`
          );

          return res
            .status(403)
            .json({
              success: false,
              error: "Forbidden: You can only book appointments for yourself.",
            });
        } // Validate ObjectId formats for IDs

        if (
          !mongoose.Types.ObjectId.isValid(doctorId) ||
          !mongoose.Types.ObjectId.isValid(patientId)
        ) {
          console.error("POST Appointment: Invalid ID format.");

          return res
            .status(400)
            .json({
              success: false,
              error: "Invalid doctorId or patientId format.",
            });
        } // Check if doctor and patient actually exist in the database

        const existingDoctor = await Doctor.findById(doctorId);

        if (!existingDoctor) {
          console.warn("POST Appointment: Doctor not found with ID:", doctorId);

          return res
            .status(404)
            .json({ success: false, error: "Selected doctor not found." });
        }

        const existingPatient = await Patient.findById(patientId);

        if (!existingPatient) {
          console.warn(
            "POST Appointment: Patient not found with ID:",
            patientId
          );

          return res
            .status(404)
            .json({ success: false, error: "Patient not found." });
        } // Validate date (cannot be in the past)

        const appointmentDateTime = new Date(`${date}T${time}:00`); // Combine date and time

        if (isNaN(appointmentDateTime.getTime())) {
          return res
            .status(400)
            .json({ success: false, error: "Invalid date or time format." });
        }

        if (appointmentDateTime < new Date()) {
          console.warn("POST Appointment: Attempt to book in the past.");

          return res
            .status(400)
            .json({
              success: false,
              error: "Cannot book an appointment in the past.",
            });
        } // Additional validations (e.g., time slot availability - more complex, might need another endpoint) // For now, we'll allow booking if time slot is not explicitly checked. // Create the new appointment document

        const newAppointment = await Appointment.create({
          patient: patientId,

          doctor: doctorId,

          date: new Date(date), // Store as Date object

          time,

          reason,

          notes: notes || undefined,

          status: apptStatus || "Pending", // Default to 'Pending' if not provided
        }); // Populate doctor and patient info for the response

        const populatedAppointment = await Appointment.findById(
          newAppointment._id
        )

          .populate("patient", "name surname email")

          .populate("doctor", "name surname specialization email");

        res
          .status(201)
          .json({
            success: true,
            data: populatedAppointment,
            message: "Appointment booked successfully!",
          });
      } catch (error: any) {
        console.error("Error creating appointment:", error); // Handle Mongoose validation errors

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
            error: error.message || "Failed to book appointment.",
          });
      }

      break;

    default:
      res.setHeader("Allow", ["GET", "POST"]);

      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
