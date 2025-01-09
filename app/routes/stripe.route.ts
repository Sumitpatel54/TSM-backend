import express from "express"

import StripeContorller from "../controllers/stripe.controller"
import { requireUserToLogin } from "../middleware/routeAccess.middleware"

const router = express.Router()

router.get("/", StripeContorller.getAllProductsAndPlans as any)
router.post("/createSubscription", requireUserToLogin, StripeContorller.createSubscription as any)
router.post("/upgradeSubscription", requireUserToLogin, StripeContorller.upgradeSubscription as any)
router.post("/unsubscribe", requireUserToLogin, StripeContorller.unsubscribeUser as any)
router.post("/charge", requireUserToLogin, StripeContorller.chargeCard as any)
//router.post("/webhook", express.raw({ type: "*/*" }), StripeContorller.stripeWebhook as any)
router.post("/checkout", requireUserToLogin, StripeContorller.checkout as any)

// New coupon routes
router.post("/validate-coupon", requireUserToLogin, StripeContorller.validateCoupon as any)
router.get("/list-coupons", requireUserToLogin, StripeContorller.listAvailableCoupons as any)

export = router
