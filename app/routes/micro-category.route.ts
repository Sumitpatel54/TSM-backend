import express from "express"

import config from "../configurations/config"
import MicroCategoryContorller from "../controllers/micro-category.controller"
import { verifyToken } from "../middleware/auth.middleware"
import { routeAccess } from "../middleware/routeAccess.middleware"

const router = express.Router()
const onlyAdminPermission = config.routePermission.onlyAdmin

router.put("/createMicroCategory", verifyToken as any, routeAccess(onlyAdminPermission) as any, MicroCategoryContorller.apiCreateMicroCategory as any)
router.get("/retrieveMicroCategory/:id", verifyToken as any, routeAccess(onlyAdminPermission) as any, MicroCategoryContorller.apiRetrieveMicroCategory as any)
router.get("/listMicroCategories", verifyToken as any, routeAccess(onlyAdminPermission) as any, MicroCategoryContorller.apiListMicroCategories as any)
router.post("/updateMicroCategory/:id", verifyToken as any, routeAccess(onlyAdminPermission) as any, MicroCategoryContorller.apiUpdateMicroCategory as any)
router.delete("/deleteMicroCategory/:id", verifyToken as any, routeAccess(onlyAdminPermission) as any, MicroCategoryContorller.apiDeleteMicroCategory as any)

export = router
