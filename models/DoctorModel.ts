// models/DoctorModel.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IDoctor extends Document {
  name: string;
  email: string;
  password: string;
  specialization: string;
  qualifications: string[];
  licenseNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

const DoctorSchema = new Schema<IDoctor>(
  {
    // Doctor fields
  },
  { timestamps: true }
);

export const Doctor = mongoose.model<IDoctor>("Doctor", DoctorSchema);