// pages/api/auth/register.ts
import { registerPatient } from "../../../controllers/authController";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    await registerPatient(req, res);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}