import express from "express"

import config from "../configurations/config"
import NutritionInformationContorller from "../controllers/nutrition-information.controller"
import { verifyToken } from "../middleware/auth.middleware"
import { routeAccess } from "../middleware/routeAccess.middleware"

const router = express.Router()
const onlyAdminPermission = config.routePermission.onlyAdmin

router.get("/retrieveNutritionInformation", NutritionInformationContorller.apiRetrieveNutritionInformation as any)
router.post("/createNutritionInformation", verifyToken as any, routeAccess(onlyAdminPermission) as any, NutritionInformationContorller.apiCreateNuritionInformation as any)
router.put("/updateNutritionInformation/:id", verifyToken as any, routeAccess(onlyAdminPermission) as any, NutritionInformationContorller.apiUpdateNutritionInformation as any)
router.delete("/deleteNutritionInformation/:id", verifyToken as any, routeAccess(onlyAdminPermission) as any, NutritionInformationContorller.apiDeleteNutritionInformation as any)

export = router
