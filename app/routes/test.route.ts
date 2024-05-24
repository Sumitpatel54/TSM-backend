import express from "express"

import config from "../configurations/config"
import AdminController from "../controllers/admin.controller"
import { verifyToken } from "../middleware/auth.middleware"
import { routeAccess } from "../middleware/routeAccess.middleware"

const router = express.Router()
const onlyAdminPermission = config.routePermission.onlyAdmin

router.get("/adminAccessOnly", verifyToken as any, routeAccess(onlyAdminPermission) as any, AdminController.adminAccessOnly)
router.get("/userAccessOnly", verifyToken as any, AdminController.userAccessOnly)


export = router
