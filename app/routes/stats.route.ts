import express from "express"

const router = express.Router()
import StatsContorller from "../controllers/stats.controller"

router.get("/", StatsContorller.apiGetUserInfo as any)
router.get("/getRevenueInfo", StatsContorller.apiGetRevenueInfo as any)

export = router
