// pages/api/register.ts
import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import Patient from '@/models/Patient'; // Ensure this path is correct
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  console.log('Request body:', req.body);

  // Extract all fields from the request body that are relevant to the Patient model
  const {
    name,
    surname,
    email,
    password,
    phone,
    address, // This will be an object { street, city, state, zipCode, country }
    dateOfBirth,
    gender,
  } = req.body;

  // Basic validation for essential fields at registration
  if (!name || !surname || !email || !password) {
    console.log('Missing essential fields:', { name, surname, email, password });
    return res.status(400).json({ message: 'Missing required fields: name, surname, email, and password are essential for registration.' });
  }

  // You might add more specific validation here for new fields if they are required
  // For example:
  if (phone && !/^\d{10}$/.test(phone)) {
    return res.status(400).json({ message: 'Invalid phone number format.' });
  }
  if (gender && !['Male', 'Female'].includes(gender)) {
    return res.status(400).json({ message: 'Invalid gender value.' });
  }

  try {
    await dbConnect();

    const existingUser = await Patient.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Prepare the patient data, only including fields that have values
    const patientData: any = {
      name,
      surname,
      email,
      password: hashedPassword,
      role: 'patient', // Always default to 'patient' on registration
    };

    // Conditionally add optional fields if they exist in the request body
    if (phone) patientData.phone = phone;
    if (address) patientData.address = address; // Ensure address is passed as an object
    if (dateOfBirth) patientData.dateOfBirth = new Date(dateOfBirth); // Convert to Date object
    if (gender) patientData.gender = gender;

    const newUser = await Patient.create(patientData);

    return res.status(201).json({
      message: 'User created successfully',
      userId: newUser._id,
      // You might return a subset of user data, but avoid sending hashed password
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        // ... include other non-sensitive fields you want to return
      }
    });
  } catch (error) {
    console.error('API Error during registration:', error);

    // More granular error handling based on Mongoose validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      const messages = Object.values(error.errors).map(err => (err as any).message);
      return res.status(400).json({ message: 'Validation failed', errors: messages });
    }
    if ((error as any).code === 11000) { // Duplicate key error (e.g., unique email)
      return res.status(409).json({ message: 'Email already registered. Please use a different email.' });
    }

    return res.status(500).json({
      message: 'Internal server error during registration',
      error: (error as Error).message,
    });
  }
}