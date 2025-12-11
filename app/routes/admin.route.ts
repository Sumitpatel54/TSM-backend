import express from "express"
import config from "../configurations/config"
import AdminController from "../controllers/admin.controller"
import checkEmailExists from "../middleware/checkEmailExists"
import { verifyToken } from "../middleware/auth.middleware"
import { routeAccess } from "../middleware/routeAccess.middleware"

const router = express.Router()
const onlyAdminPermission = config.routePermission.onlyAdmin

// Alle disse krever nå admin-tilgang
router.get("/getAdmin/:id", verifyToken as any, routeAccess(onlyAdminPermission) as any, AdminController.apiGetAdmin)
router.put("/createAdmin", verifyToken as any, routeAccess(onlyAdminPermission) as any, checkEmailExists as any, AdminController.apiCreateAdmin)
router.post("/updateAdmin/:id", verifyToken as any, routeAccess(onlyAdminPermission) as any, AdminController.apiUpdateAdmin)
router.delete("/deleteAdmin/:id", verifyToken as any, routeAccess(onlyAdminPermission) as any, AdminController.apiDeleteAdmin)

export = router
