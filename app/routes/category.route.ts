import express from "express"

import config from "../configurations/config"
import CategoryContorller from "../controllers/category.controller"
import { verifyToken } from "../middleware/auth.middleware"
import { routeAccess } from "../middleware/routeAccess.middleware"

const router = express.Router()
const onlyAdminPermission = config.routePermission.onlyAdmin

router.put("/createCategory", verifyToken as any, routeAccess(onlyAdminPermission) as any, CategoryContorller.apiCreateCategory as any)
router.get("/retrieveCategory/:id", verifyToken as any, routeAccess(onlyAdminPermission) as any, CategoryContorller.apiRetrieveCategory as any)
router.get("/listCategories", verifyToken as any, routeAccess(onlyAdminPermission) as any, CategoryContorller.apiListCategories as any)
router.post("/updateCategory/:id", verifyToken as any, routeAccess(onlyAdminPermission) as any, CategoryContorller.apiUpdateCategory as any)
router.delete("/deleteCategory/:id", verifyToken as any, routeAccess(onlyAdminPermission) as any, CategoryContorller.apiDeleteCategory as any)

export = router
