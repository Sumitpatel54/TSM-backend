import express from "express"

import config from "../configurations/config"
import SubCategoryContorller from "../controllers/sub-category.controller"
import { verifyToken } from "../middleware/auth.middleware"
import { routeAccess } from "../middleware/routeAccess.middleware"

const router = express.Router()
const onlyAdminPermission = config.routePermission.onlyAdmin

router.put("/createSubCategory", verifyToken as any, routeAccess(onlyAdminPermission) as any, SubCategoryContorller.apiCreateSubCategory as any)
router.get("/retrieveSubCategory/:id", verifyToken as any, routeAccess(onlyAdminPermission) as any, SubCategoryContorller.apiRetrieveSubCategory as any)
router.get("/listSubCategories", verifyToken as any, routeAccess(onlyAdminPermission) as any, SubCategoryContorller.apiListSubCategories as any)
router.post("/updateSubCategory/:id", verifyToken as any, routeAccess(onlyAdminPermission) as any, SubCategoryContorller.apiUpdateSubCategory as any)
router.delete("/deleteSubCategory/:id", verifyToken as any, routeAccess(onlyAdminPermission) as any, SubCategoryContorller.apiDeleteSubCategory as any)

export = router
