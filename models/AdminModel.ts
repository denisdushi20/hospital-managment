// models/AdminModel.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IAdmin extends Document {
  name: string;
  email: string;
  password: string;
  department: string;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    // Admin fields
  },
  { timestamps: true }
);

export const Admin = mongoose.model<IAdmin>("Admin", AdminSchema);