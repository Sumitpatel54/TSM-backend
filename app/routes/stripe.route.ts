import express from "express"

import StripeContorller from "../controllers/stripe.controller"
import { requireUserToLogin } from "../middleware/routeAccess.middleware"
import { skipAuth } from "../middleware/skipAuth.middleware"
import { optionalAuth } from "../middleware/optionalAuth.middleware" // <-- 1. IMPORTER DEN NYE

const router = express.Router()

router.get("/", StripeContorller.getAllProductsAndPlans as any)
router.post("/createSubscription", requireUserToLogin, StripeContorller.createSubscription as any)
router.post("/upgradeSubscription", requireUserToLogin, StripeContorller.upgradeSubscription as any)
router.post("/unsubscribe", requireUserToLogin, StripeContorller.unsubscribeUser as any)
router.post("/charge", requireUserToLogin, StripeContorller.chargeCard as any)
//router.post("/webhook", express.raw({ type: "*/*" }), StripeContorller.stripeWebhook as any)

// **** 2. LEGG TIL MIDDLEWARE HER ****
// Denne ruten bruker nå "optionalAuth" for å sjekke om en bruker ER logget inn
router.post("/checkout", optionalAuth as any, StripeContorller.checkout as any)

router.post("/manual-update-paid", requireUserToLogin, StripeContorller.manualUpdatePaidStatus as any)
router.post("/confirm-payment", StripeContorller.confirmPaymentSuccess as any)

// New coupon routes
router.post("/validate-coupon", requireUserToLogin, StripeContorller.validateCoupon as any)
router.get("/list-coupons", requireUserToLogin, StripeContorller.listAvailableCoupons as any)

// New routes for payment-first flow
router.get("/verify-session/:sessionId", skipAuth as any, StripeContorller.verifyCheckoutSession as any)
// Replaced registerAfterPayment with confirmPaymentSuccess
router.post("/confirm-payment-success", skipAuth as any, StripeContorller.confirmPaymentSuccess as any) 
// Corrected function name from manualUpdateSessionStatus to manualUpdatePaidStatus
router.post("/update-paid-status", skipAuth as any, StripeContorller.manualUpdatePaidStatus as any) 

export = router
