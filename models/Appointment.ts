// models/Appointment.ts
import mongoose, { Schema, Document, Types } from "mongoose";

// Define the interface for your Patient document (if not already defined)
// This is needed for TypeScript type checking when referencing Patient in Appointment
interface IPatient extends Document {
  name: string;
  surname: string;
  email: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  dateOfBirth?: Date;
  gender?: "Male" | "Female";
}

interface IDoctor extends Document {
  name: string;
  surname: string;
  email: string;
  specialization?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  dateOfBirth?: Date;
  gender?: "Male" | "Female";
}


export interface IAppointment extends Document {
  patient: Types.ObjectId | IPatient;
  doctor: Types.ObjectId | IDoctor;
  date: Date;
  time: string;
  reason: string;
  status: "Scheduled" | "Completed" | "Cancelled" | "Pending";
  notes?: string; 
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema: Schema = new Schema(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: [true, "Patient is required for the appointment."],
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Doctor is required for the appointment."],
    },
    date: {
      type: Date,
      required: [true, "Appointment date is required."],
      min: [new Date(), "Appointment date cannot be in the past."],
    },
    time: {
      type: String,
      required: [true, "Appointment time is required."],
      match: [
        /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/,
        "Please use HH:MM format for time.",
      ],
    },
    reason: {
      type: String,
      required: [true, "Reason for appointment is required."],
      minlength: [10, "Reason must be at least 10 characters long."],
      maxlength: [500, "Reason cannot exceed 500 characters."],
    },
    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled", "Pending"],
      default: "Pending",
    },
    notes: {
      type: String,
      maxlength: [1000, "Notes cannot exceed 1000 characters."],
    },
  },
  {
    timestamps: true,
  }
);

// Ensure the model is only created once if it doesn't already exist
const Appointment = (mongoose.models.Appointment ||
  mongoose.model<IAppointment>(
    "Appointment",
    AppointmentSchema
  )) as mongoose.Model<IAppointment>;

export default Appointment;
