import express from "express"
import config from "../configurations/config"
import { verifyToken } from "../middleware/auth.middleware"
import { routeAccess } from "../middleware/routeAccess.middleware"
import StatsContorller from "../controllers/stats.controller"

const router = express.Router()
const onlyAdminPermission = config.routePermission.onlyAdmin

// Nå krever disse rutene at du er logget inn OG er admin
router.get("/", verifyToken as any, routeAccess(onlyAdminPermission) as any, StatsContorller.apiGetUserInfo as any)
router.get("/getRevenueInfo", verifyToken as any, routeAccess(onlyAdminPermission) as any, StatsContorller.apiGetRevenueInfo as any)

export = router
