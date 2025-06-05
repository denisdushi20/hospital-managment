// pages/api/register.ts
import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import Patient from '@/models/Patient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  console.log('Request body:', req.body);

  const { name, surname, email, password } = req.body;

  if (!name || !surname || !email || !password) {
    console.log('Missing fields:', { name, surname, email, password }); 
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    await dbConnect();

    const existingUser = await Patient.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await Patient.create({
      name,
      surname,
      email,
      password: hashedPassword,
      role: 'patient',
    });

    return res.status(201).json({ 
      message: 'User created successfully', 
      userId: newUser._id 
    });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: (error as Error).message 
    });
  }
}