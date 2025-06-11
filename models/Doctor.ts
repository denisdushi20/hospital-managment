import mongoose, { Schema, model, models } from "mongoose";

const doctorSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters long"],
    },
    surname: {
      type: String,
      required: [true, "Surname is required"],
      trim: true,
      minlength: [4, "Surname must be at least 4 characters long"],
    },
    specialization: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/.+@.+\..+/, "Please enter a valid email address"],
    },
    phone: {
      type: String,
      trim: true,
      required: [true, "Phone number is required"],
      match: [/^\d{10}$/, "Please enter a valid 10-digit phone number"],
    },
    address: {
      street: { type: String, trim: true, required: [true, "Street address is required"] },
      city: { type: String, trim: true, required: [true, "City is required"] },
      state: { type: String, trim: true, required: [true, "State is required"] },
      zipCode: { type: String, trim: true, required: [true, "Zip Code is required"] },
      country: { type: String, trim: true, required: [true, "Country is required"] },
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Date of Birth is required"],
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: ["Male", "Female"],
    },
    password: { type: String, required: true },
    role: { type: String, default: "doctor" },
    lastLogin: { type: Date },
  },
  {
    timestamps: true,
  }
);

export default models.Doctor || model("Doctor", doctorSchema);
