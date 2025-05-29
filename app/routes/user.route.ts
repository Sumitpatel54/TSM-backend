import express from "express"

// import config from "../configurations/config"
import UserController from "../controllers/user.controller"
// import { verifyToken } from "../middleware/auth.middleware"
import { requireUserToLogin } from "../middleware/routeAccess.middleware"
import { verifyToken } from "../middleware/auth.middleware"

const router = express.Router()
// const onlyAdminPermission = config.routePermission.onlyAdmin

// Get current user data
router.get("/me", verifyToken as any, UserController.apiGetCurrentUser as any)

router.get("/:id", UserController.apiGetUser)
router.put("/:id", requireUserToLogin, UserController.apiUpdateUser)

// New routes for daily exercises and nutrition
router.get('/dailyExercises/:id', requireUserToLogin, UserController.fetchDailyExercises)
router.get('/dailyNutrition/:id', requireUserToLogin, UserController.fetchDailyNutrition)
router.post('/storeDailyExercises', requireUserToLogin, UserController.storeDailyExercises)
router.post('/storeDailyNutrition', requireUserToLogin, UserController.storeDailyNutrition)

export = router
