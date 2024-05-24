import express from "express"

import * as StripeWebHookController from "../controllers/stripeWebHook.controller"

const router = express.Router()

router.post("/", StripeWebHookController.postWebhook)
export = router
