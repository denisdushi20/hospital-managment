// models/PatientModel.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IPatient extends Document {
  name: string;
  email: string;
  password: string;
  dateOfBirth: Date;
  bloodType?: string;
  allergies?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema = new Schema<IPatient>(
  {
    // Patient fields
  },
  { timestamps: true }
);

export const Patient = mongoose.model<IPatient>("Patient", PatientSchema);