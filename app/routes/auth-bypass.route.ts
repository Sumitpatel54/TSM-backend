import express from "express"
import StripeContorller from "../controllers/stripe.controller"

const router = express.Router()

// Denne ruten brukes av "Complete Registration"-knappen
router.post("/register-after-payment", StripeContorller.registerAfterPayment as any)

// Andre ruter
router.post("/confirm-payment", StripeContorller.confirmPaymentSuccess as any)
router.get("/verify-session/:sessionId", StripeContorller.verifyCheckoutSession as any)
router.post("/update-paid-status", StripeContorller.manualUpdatePaidStatus as any)

export = router
