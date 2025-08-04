import express from "express"

import StripeContorller from "../controllers/stripe.controller"
import { requireUserToLogin } from "../middleware/routeAccess.middleware"
import { skipAuth } from "../middleware/skipAuth.middleware"

const router = express.Router()

router.get("/", StripeContorller.getAllProductsAndPlans as any)
router.post("/createSubscription", requireUserToLogin, StripeContorller.createSubscription as any)
router.post("/upgradeSubscription", requireUserToLogin, StripeContorller.upgradeSubscription as any)
router.post("/unsubscribe", requireUserToLogin, StripeContorller.unsubscribeUser as any)
router.post("/charge", requireUserToLogin, StripeContorller.chargeCard as any)
//router.post("/webhook", express.raw({ type: "*/*" }), StripeContorller.stripeWebhook as any)

// Modified to allow payment without login for payment-first flow
router.post("/checkout", StripeContorller.checkout as any)

router.post("/manual-update-paid", requireUserToLogin, StripeContorller.manualUpdatePaidStatus as any)
router.post("/confirm-payment", StripeContorller.confirmPaymentSuccess as any)

// New coupon routes
router.post("/validate-coupon", requireUserToLogin, StripeContorller.validateCoupon as any)
router.get("/list-coupons", requireUserToLogin, StripeContorller.listAvailableCoupons as any)

// New routes for payment-first flow
router.get("/verify-session/:sessionId", skipAuth as any, StripeContorller.verifyCheckoutSession as any)
router.post("/register-after-payment", skipAuth as any, StripeContorller.registerAfterPayment as any)
router.post("/update-session-status", skipAuth as any, StripeContorller.manualUpdateSessionStatus as any)

export = router
