import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await Admin.create({
      name: 'Admin',
      surname: 'User',
      email: 'admin@example.com',
      password: hashedPassword,
    });

    res.status(201).json({ success: true, data: admin });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}
