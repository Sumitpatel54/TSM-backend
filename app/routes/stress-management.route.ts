import express from "express"

import config from "../configurations/config"
import StressManagementContorller from "../controllers/stress-management.controller"
import { verifyToken } from "../middleware/auth.middleware"
import { routeAccess } from "../middleware/routeAccess.middleware"

const router = express.Router()
const onlyAdminPermission = config.routePermission.onlyAdmin

router.get("/", StressManagementContorller.apiListStressManagement as any)
router.post("/",verifyToken as any, routeAccess(onlyAdminPermission) as any, StressManagementContorller.apiCreateStressManagement as any)
router.get("/:id", StressManagementContorller.apiRetrieveStressManagement as any)
router.put("/:id",verifyToken as any, routeAccess(onlyAdminPermission) as any, StressManagementContorller.apiUpdateStressManagement as any)
router.delete("/:id",verifyToken as any, routeAccess(onlyAdminPermission) as any, StressManagementContorller.apiDeleteStressManagement as any)
router.get("/:id/detail/:detailId", StressManagementContorller.apiSingleRetrieveStressManagementDetail as any)
router.get("/search/all", StressManagementContorller.searchStressManagementDetail as any)
router.post("/:id/detail",verifyToken as any, routeAccess(onlyAdminPermission) as any, StressManagementContorller.apiAddStressManagementDetail as any)
router.put("/:id/detail/:detailId", StressManagementContorller.apiUpdateStressManagementDetail as any)
router.delete("/:id/detail/:detailId",verifyToken as any, routeAccess(onlyAdminPermission) as any, StressManagementContorller.apiRemoveStressManagementDetail as any)

export = router
