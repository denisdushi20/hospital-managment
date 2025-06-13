// pages/api/admins/index.ts

import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/mongodb"; // Adjust path as needed
import Admin from "@/models/Admin"; // Adjust path as needed
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]"; // Relative path to your authOptions
import bcrypt from "bcryptjs"; // For password hashing

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect(); // Connect to MongoDB

  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user || session.user.role !== "admin") {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized access" });
  }

  if (req.method === "GET") {
    try {
      // Fetch all admins, exclude password and the currently logged-in admin
      const admins = await Admin.find({
        email: { $ne: session.user.email },
      }).select("-password");
      return res.status(200).json({ success: true, data: admins });
    } catch (error: any) {
      console.error("Error fetching admins:", error);
      return res
        .status(500)
        .json({
          success: false,
          message: error.message || "Failed to fetch administrators",
        });
    }
  } else if (req.method === "POST") {
    try {
      const { password, ...adminData } = req.body;

      if (!password) {
        return res
          .status(400)
          .json({ success: false, message: "Password is required" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newAdmin = await Admin.create({
        ...adminData,
        password: hashedPassword,
        role: "admin",
      });

      const { password: _, ...adminWithoutPassword } = newAdmin.toObject();
      return res
        .status(201)
        .json({ success: true, data: adminWithoutPassword });
    } catch (error: any) {
      console.error("Error creating admin:", error);

      if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
        return res
          .status(409)
          .json({
            success: false,
            message: "An administrator with this email already exists.",
          });
      }

      if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map(
          (err: any) => err.message
        );
        return res
          .status(400)
          .json({ success: false, message: messages.join(", ") });
      }

      return res
        .status(500)
        .json({
          success: false,
          message: error.message || "Failed to create administrator",
        });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
