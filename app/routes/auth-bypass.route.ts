import express from "express"
import StripeContorller from "../controllers/stripe.controller"

const router = express.Router()

// Create direct routes that completely bypass authentication
router.post("/register-after-payment", StripeContorller.registerAfterPayment as any)
router.get("/verify-session/:sessionId", StripeContorller.verifyCheckoutSession as any)
router.post("/update-session-status", StripeContorller.manualUpdateSessionStatus as any)

export = router
