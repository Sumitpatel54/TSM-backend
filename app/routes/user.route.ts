import express from "express"

// import config from "../configurations/config"
import UserController from "../controllers/user.controller"
// import { verifyToken } from "../middleware/auth.middleware"
import { requireUserToLogin } from "../middleware/routeAccess.middleware"

const router = express.Router()
// const onlyAdminPermission = config.routePermission.onlyAdmin

router.get("/:id", UserController.apiGetUser)
router.put("/:id", requireUserToLogin, UserController.apiUpdateUser)

// New routes for daily exercises and nutrition
router.get('/dailyExercises', requireUserToLogin, UserController.fetchDailyExercises)
router.get('/dailyNutrition', requireUserToLogin, UserController.fetchDailyNutrition)
router.post('/storeDailyExercises', requireUserToLogin, UserController.storeDailyExercises)
router.post('/storeDailyNutrition', requireUserToLogin, UserController.storeDailyNutrition)

export = router
