import express from "express"

// import config from "../configurations/config"
import UserController from "../controllers/user.controller"
// import { verifyToken } from "../middleware/auth.middleware"
import { requireUserToLogin } from "../middleware/routeAccess.middleware"

const router = express.Router()
// const onlyAdminPermission = config.routePermission.onlyAdmin

router.get("/:id", UserController.apiGetUser)
router.put("/:id", requireUserToLogin, UserController.apiUpdateUser)

export = router
