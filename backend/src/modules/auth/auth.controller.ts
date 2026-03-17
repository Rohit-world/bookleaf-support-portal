import { Request, Response } from "express";
import User from "../../models/User.model";
import Author from "../../models/Author.model";
import Admin from "../../models/Admin.model";
import { comparePassword } from "../../utils/hashPassword";
import { generateToken } from "../../utils/jwt";
import { AuthRequest } from "../../middleware/auth.middleware";

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    let profile = null;

    if (user.role === "author") {
      profile = await Author.findOne({ userId: user._id }).lean();
    } else if (user.role === "admin") {
      profile = await Admin.findOne({ userId: user._id }).lean();
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profile,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Login failed",
    });
  }
}

export async function getCurrentUser(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await User.findById(req.user.userId).select("-password").lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let profile = null;

    if (user.role === "author") {
      profile = await Author.findOne({ userId: user._id }).lean();
    } else if (user.role === "admin") {
      profile = await Admin.findOne({ userId: user._id }).lean();
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          ...user,
          profile,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch current user",
    });
  }
}
