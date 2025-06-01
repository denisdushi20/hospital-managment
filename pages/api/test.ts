import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/mongodb'; // or use relative if alias doesn't work

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectDB();
    res.status(200).json({ message: "MongoDB connected successfully ✅" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "MongoDB connection failed ❌" });
  }
}
