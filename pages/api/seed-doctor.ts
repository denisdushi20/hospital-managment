import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Doctor from '@/models/Doctor';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const hashedPassword = await bcrypt.hash('password123', 10); // Default password

    const doctor = await Doctor.create({
      name: 'John',
      surname: 'Doe',
      specialization: 'Cardiology',
      email: 'admin@gmail.com',
      password: hashedPassword,
    });

    res.status(201).json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}
