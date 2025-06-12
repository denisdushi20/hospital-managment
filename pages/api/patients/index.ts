// pages/api/patients/index.ts
import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/mongodb";
import Patient from "@/models/Patient";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]"; // Adjust path if needed

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  // 1. Authentication and Authorization (Crucial!)
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== "admin") {
    return res
      .status(403)
      .json({
        message: "Forbidden: You must be an admin to access this resource.",
      });
  }

  if (req.method === "GET") {
    // This is the 'display-user' / 'get-all-patients' functionality
    try {
      const patients = await Patient.find({}).select("-password").lean();
      return res.status(200).json({ success: true, data: patients });
    } catch (error) {
      console.error("Error fetching patients:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
