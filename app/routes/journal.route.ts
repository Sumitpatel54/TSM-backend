// app/routes/journal.route.ts
import express from "express";
import { generateJournalToken, verifyJournalToken } from "../controllers/journal.controller";
import { verifyToken } from "../middleware/auth.middleware";

const router = express.Router();

// Generate token - requires authentication
router.get("/generate-token", verifyToken as any, generateJournalToken as any);

// Verify token - public endpoint (called by Headache Journal)
router.post("/verify-token", verifyJournalToken as any);

export default router;
