import express from "express"

import config from "../configurations/config"
import NutritionExampleContorller from "../controllers/nutrition-example.controller"
import { verifyToken } from "../middleware/auth.middleware"
import { routeAccess } from "../middleware/routeAccess.middleware"

const router = express.Router()
const onlyAdminPermission = config.routePermission.onlyAdmin

router.get("/", NutritionExampleContorller.apiRetrieveNutritionExample as any)
router.get("/:id", NutritionExampleContorller.apiSingleRetrieveNutritionExample as any)
router.post("/", verifyToken as any, routeAccess(onlyAdminPermission) as any, NutritionExampleContorller.apiCreateNutritionExample as any)
router.post("/:id/meal", verifyToken as any, routeAccess(onlyAdminPermission) as any, NutritionExampleContorller.apiAddMeal as any)
router.get('/:id/meal/:mealId', NutritionExampleContorller.apiSingleRetrieveNutritionExampleMeal as any)
router.get('/searchMeals/all', NutritionExampleContorller.searchMeals as any)
router.put('/:id', verifyToken as any, routeAccess(onlyAdminPermission) as any, NutritionExampleContorller.apiUpdateNutritionExampleCategory as any)
router.put('/:id/meal/:mealId', verifyToken as any, routeAccess(onlyAdminPermission) as any, NutritionExampleContorller.apiUpdateNutritionExampleMeal as any)
router.delete('/:id/meal/:mealId', verifyToken as any, routeAccess(onlyAdminPermission) as any, NutritionExampleContorller.apiRemoveMeal as any)
router.delete("/:id", verifyToken as any, routeAccess(onlyAdminPermission) as any, NutritionExampleContorller.apiDeleteNutritionExample as any)

export = router
