// app/controllers/journal.controller.ts
// Handles token generation and verification for Headache Journal SSO

import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import UserService from "../services/user.service";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const TOKEN_EXPIRY = "1h";

export const generateJournalToken = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        status: false,
        message: "Authentication required"
      });
    }

    const user = await UserService.findUser({ _id: userId });
    
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found"
      });
    }

    const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");

    const payload = {
      userId: user._id.toString(),
      email: user.email,
      name: fullName,
      isPaid: user.isPaid || false,
      type: "journal_access"
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

    return res.status(200).json({
      status: true,
      token: token,
      redirectUrl: "https://headachejournal.curemigraine.org/auth/curemigraine?token=" + token
    });

  } catch (error: any) {
    console.error("Error generating journal token:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to generate token"
    });
  }
};

export const verifyJournalToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        valid: false,
        message: "Token is required"
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (decoded.type !== "journal_access") {
      return res.status(400).json({
        valid: false,
        message: "Invalid token type"
      });
    }

    return res.status(200).json({
      valid: true,
      user: {
        email: decoded.email,
        name: decoded.name,
        isPaid: decoded.isPaid
      }
    });

  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        valid: false,
        message: "Token has expired"
      });
    }
    
    console.error("Error verifying journal token:", error);
    return res.status(400).json({
      valid: false,
      message: "Invalid token"
    });
  }
};

export default {
  generateJournalToken,
  verifyJournalToken
};
