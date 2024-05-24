import express from "express"

import AdminController from "../controllers/admin.controller"
import checkEmailExists from "../middleware/checkEmailExists"

const router = express.Router()

router.get("/getAdmin/:id", AdminController.apiGetAdmin)
router.put("/createAdmin", checkEmailExists as any, AdminController.apiCreateAdmin)
router.post("/updateAdmin/:id", AdminController.apiUpdateAdmin)
router.delete("/deleteAdmin/:id", AdminController.apiDeleteAdmin)


export = router
