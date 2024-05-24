import express from "express"

import config from "../configurations/config"
import exerciseInformationContorller from "../controllers/exercise-information.controller"
import { verifyToken } from "../middleware/auth.middleware"
import { routeAccess } from "../middleware/routeAccess.middleware"

const router = express.Router()
const onlyAdminPermission = config.routePermission.onlyAdmin

router.get("/retrieveExerciseInformation", exerciseInformationContorller.apiRetrieveExerciseInformation as any)
router.post("/createExerciseInformation", verifyToken as any, routeAccess(onlyAdminPermission) as any, exerciseInformationContorller.apiCreateExerciseInformation as any)
router.put("/updateExerciseInformation/:id", verifyToken as any, routeAccess(onlyAdminPermission) as any, exerciseInformationContorller.apiUpdateExerciseInformation as any)
router.delete("/deleteExerciseInformation/:id", verifyToken as any, routeAccess(onlyAdminPermission) as any, exerciseInformationContorller.apiDeleteExerciseInformation as any)

export = router
