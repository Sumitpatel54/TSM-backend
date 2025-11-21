import express from "express"
import StripeContorller from "../controllers/stripe.controller"

const router = express.Router()

// Create direct routes that completely bypass authentication

// 1. Replaced registerAfterPayment with confirmPaymentSuccess (Existing)
router.post("/confirm-payment", StripeContorller.confirmPaymentSuccess as any) 

// 2. RESTORED MISSING ROUTE (Now points to the correct registration function)
router.post("/register-after-payment", StripeContorller.registerAfterPayment as any)

router.get("/verify-session/:sessionId", StripeContorller.verifyCheckoutSession as any)

// Corrected function name from manualUpdateSessionStatus to manualUpdatePaidStatus
router.post("/update-paid-status", StripeContorller.manualUpdatePaidStatus as any) 

export = router
