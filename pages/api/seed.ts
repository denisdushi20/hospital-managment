// File: /pages/api/seed/patient.ts

import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Patient from '@/models/Patient';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

   

    const hashedPassword = await bcrypt.hash('patient123', 10);

    
    const localPatient = await Patient.create({
      name: 'Jane',
      surname: 'Smith',
      email: 'jane@example.com',
      password: hashedPassword,
      medicalHistory: 'Seasonal Flu, Allergies',
      role: 'patient',
    });

  
    const googlePatient = await Patient.create({
      name: 'Google',
      surname: 'User',
      email: 'google.user@example.com',
      medicalHistory: 'No records yet',
      role: 'patient',
      // password is optional — not included
    });

    res.status(201).json({
      success: true,
      data: [localPatient, googlePatient],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}
