import express from "express"

import config from "../configurations/config"
import ExerciseContorller from "../controllers/exercise.controller"
import { verifyToken } from "../middleware/auth.middleware"
import { routeAccess } from "../middleware/routeAccess.middleware"

const router = express.Router()
const onlyAdminPermission = config.routePermission.onlyAdmin

router.get("/listExercises", ExerciseContorller.apiListExercises as any)
// router.get("/updateMany", ExerciseContorller.apiUpdateMany as any)
router.get("/retrieveExercise/:id", ExerciseContorller.apiRetrieveExercise as any)
router.get("/retrieveExerciseByTitle/:title", ExerciseContorller.apiRetrieveExerciseByTitle as any)
router.post("/createExercise", verifyToken as any, routeAccess(onlyAdminPermission) as any, ExerciseContorller.apiCreateExercise as any)
// router.post("/test-upload", ExerciseContorller.apiUploadVideoTest as any)
router.put("/updateExercise/:id", verifyToken as any, routeAccess(onlyAdminPermission) as any, ExerciseContorller.apiUpdateExercise as any)
router.delete("/deleteExercise/:id", verifyToken as any, routeAccess(onlyAdminPermission) as any, ExerciseContorller.apiDeleteExercise as any)

router.post("/exerciseList", ExerciseContorller.apiAddNewExercisesToExerciseList)
// router.get("/exerciseList", verifyToken as any, routeAccess(onlyAdminPermission) as any, ExerciseContorller.apiGetExerciseList)
router.get("/exerciseList/:id", ExerciseContorller.apiGetSingleExerciseItem)
router.get("/exerciseListByTagId/:tagId", ExerciseContorller.apiGetExerciseListByTagId)
router.put("/exerciseList/:id", ExerciseContorller.apiUpdateExerciseList)
router.delete("/exerciseList/:id", verifyToken as any, routeAccess(onlyAdminPermission) as any, ExerciseContorller.apiDeleteExerciseListItem)
router.get("/searchExerciseList", ExerciseContorller.searchExerciseList as any)
router.get("/getExerciseListDays/:exerciseParentId", ExerciseContorller.apiGetExerciseListDays as any)

router.post("/tag/:id", verifyToken as any, routeAccess(onlyAdminPermission) as any, ExerciseContorller.apiAddTag as any)
router.put("/tag/:id/details/:tagId", verifyToken as any, routeAccess(onlyAdminPermission) as any, ExerciseContorller.apiUpdateTag as any)
router.delete("/tag/:id/details/:tagId", verifyToken as any, routeAccess(onlyAdminPermission) as any, ExerciseContorller.apiDeleteTag as any)

export = router
