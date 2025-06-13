// pages/api/admins/change-password/[id].ts

import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/mongodb"; // Adjust path as needed
import Admin from "@/models/Admin"; // Adjust path as needed
import bcrypt from "bcryptjs"; // For password hashing
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]"; // Relative path to your authOptions

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user || session.user.role !== "admin") {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized access" });
  }

  const {
    query: { id },
    method,
  } = req;

  if (method === "PATCH") {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "New password is required" });
    }

    try {
      const admin = await Admin.findById(id);

      if (!admin) {
        return res
          .status(404)
          .json({ success: false, message: "Administrator not found" });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the admin's password
      admin.password = hashedPassword;
      await admin.save();

      return res
        .status(200)
        .json({
          success: true,
          message: "Administrator password updated successfully",
        });
    } catch (error: any) {
      console.error(`Error changing password for admin with ID ${id}:`, error);
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
          message: error.message || "Failed to change administrator password",
        });
    }
  } else {
    res.setHeader("Allow", ["PATCH"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
