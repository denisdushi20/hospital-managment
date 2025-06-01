// controllers/authController.ts
import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Patient, Doctor, Admin } from "../models/PatientModel";

const generateToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET!, {
    expiresIn: "30d",
  });
};

export const registerPatient = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { name, email, password, dateOfBirth, bloodType, allergies } = req.body;

    // Check if email exists in any collection
    const [existingPatient, existingDoctor, existingAdmin] = await Promise.all([
      Patient.findOne({ email }),
      Doctor.findOne({ email }),
      Admin.findOne({ email }),
    ]);

    if (existingPatient || existingDoctor || existingAdmin) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const patient = await Patient.create({
      name,
      email,
      password: hashedPassword,
      dateOfBirth: new Date(dateOfBirth),
      bloodType,
      allergies,
    });

    return res.status(201).json({
      _id: patient.id,
      name: patient.name,
      email: patient.email,
      role: "patient",
      token: generateToken(patient.id, "patient"),
    });
  } catch (error) {
    return res.status(400).json({ message: "Invalid registration data" });
  }
};

export const login = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { email, password } = req.body;

    // Check all collections
    const [patient, doctor, admin] = await Promise.all([
      Patient.findOne({ email }),
      Doctor.findOne({ email }),
      Admin.findOne({ email }),
    ]);

    const user = patient || doctor || admin;
    const role = patient ? "patient" : doctor ? "doctor" : "admin";

    if (user && (await bcrypt.compare(password, user.password))) {
      return res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role,
        token: generateToken(user.id, role),
      });
    }

    return res.status(401).json({ message: "Invalid credentials" });
  } catch (error) {
    return res.status(400).json({ message: "Invalid request" });
  }
};