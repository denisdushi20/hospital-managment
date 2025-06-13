// pages/api/admins/[id].ts

import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/mongodb"; // Adjust path as needed
import Admin from "@/models/Admin"; // Adjust path as needed
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]"; // Corrected relative path to your authOptions

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

  switch (method) {
    case "GET":
      try {
        const admin = await Admin.findById(id).select("-password");
        if (!admin) {
          return res
            .status(404)
            .json({ success: false, message: "Administrator not found" });
        }
        return res.status(200).json({ success: true, data: admin });
      } catch (error: any) {
        console.error(`Error fetching admin with ID ${id}:`, error);
        return res
          .status(500)
          .json({
            success: false,
            message: error.message || "Failed to fetch administrator",
          });
      }

    case "PUT":
      try {
        // Ensure that the logged-in admin cannot update their own role or other critical fields
        // without proper elevated permissions or a separate, more secure flow if needed.
        // For simplicity, we are excluding password from direct update here.
        const { password, ...updateData } = req.body;

        const updatedAdmin = await Admin.findByIdAndUpdate(id, updateData, {
          new: true,
          runValidators: true,
        }).select("-password");

        if (!updatedAdmin) {
          return res
            .status(404)
            .json({ success: false, message: "Administrator not found" });
        }
        return res.status(200).json({ success: true, data: updatedAdmin });
      } catch (error: any) {
        console.error(`Error updating admin with ID ${id}:`, error);
        if (
          error.code === 11000 &&
          error.keyPattern &&
          error.keyPattern.email
        ) {
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
            message: error.message || "Failed to update administrator",
          });
      }

    case "DELETE":
      try {
        // Prevent an admin from deleting their own account
        if (session.user.email === (await Admin.findById(id))?.email) {
          return res
            .status(403)
            .json({
              success: false,
              message: "Cannot delete your own active admin account",
            });
        }

        const deletedAdmin = await Admin.findByIdAndDelete(id);
        if (!deletedAdmin) {
          return res
            .status(404)
            .json({ success: false, message: "Administrator not found" });
        }
        return res
          .status(200)
          .json({
            success: true,
            message: "Administrator deleted successfully",
          });
      } catch (error: any) {
        console.error(`Error deleting admin with ID ${id}:`, error);
        return res
          .status(500)
          .json({
            success: false,
            message: error.message || "Failed to delete administrator",
          });
      }

    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
