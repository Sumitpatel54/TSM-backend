import express from "express"

import ProgramContorller from "../controllers/program.controller"
import { requireUserToLogin } from "../middleware/routeAccess.middleware"

const router = express.Router()

// router.get("/", requireUserToLogin, ProgramContorller.apiGetUserExercisProgram)
router.get(["/", "/general", "/postural"], requireUserToLogin, ProgramContorller.apiGetUserGeneralPosturalExerciseProgram)
router.get("/pendingExercises", requireUserToLogin, ProgramContorller.apiGetUserNotCompletedExercisProgram)
router.put("/:id/status/:templateId", requireUserToLogin, ProgramContorller.apiChangeUserExerciseStatus)
router.put("/:templateId/exercise/:exerciseId", requireUserToLogin, ProgramContorller.apiUpdateProgram)
router.get("/report", requireUserToLogin, ProgramContorller.apiGetReportBlock)

export = router
