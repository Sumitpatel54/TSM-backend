import express from "express"
import StripeContorller from "../controllers/stripe.controller"

const router = express.Router()

// Create direct routes that completely bypass authentication
// Replaced registerAfterPayment with confirmPaymentSuccess
router.post("/confirm-payment", StripeContorller.confirmPaymentSuccess as any) 
router.get("/verify-session/:sessionId", StripeContorller.verifyCheckoutSession as any)
// Corrected function name from manualUpdateSessionStatus to manualUpdatePaidStatus
router.post("/update-paid-status", StripeContorller.manualUpdatePaidStatus as any) 

export = router
