import express from "express"

import config from "../configurations/config"
import QuestionnaireContorller from "../controllers/questionnaire.controller"
import { verifyToken } from "../middleware/auth.middleware"
import { requireUserToLogin, routeAccess } from "../middleware/routeAccess.middleware"

const router = express.Router()
const onlyAdminPermission = config.routePermission.onlyAdmin

router.put("/createQuestionnaire", verifyToken as any, routeAccess(onlyAdminPermission) as any, QuestionnaireContorller.apiCreateQuestionnaire as any)
router.get("/test/:id", QuestionnaireContorller.apiGenerateTemplate as any)
router.get("/retrieveQuestionnaire/:id", verifyToken as any, routeAccess(onlyAdminPermission) as any, QuestionnaireContorller.apiRetrieveQuestionnaire as any)
router.get("/listQuestionnaire", QuestionnaireContorller.apiListQuestionnaires as any)
router.get("/searchQuestionnaires", QuestionnaireContorller.searchQuestionnaires as any)
router.get("/listAllQuestionnaires", verifyToken as any, routeAccess(onlyAdminPermission) as any, QuestionnaireContorller.apiListAllQuestionnaires as any)
router.post("/updateQuestionnaire/:id", verifyToken as any, routeAccess(onlyAdminPermission) as any, QuestionnaireContorller.apiUpdateQuestionnaire as any)
router.delete("/deleteQuestionnaire/:id", QuestionnaireContorller.apiDeleteQuestionnaire as any)

router.get("/retrieveFirstQuestion", requireUserToLogin, QuestionnaireContorller.apiGetFirstQuestion as any)
router.get("/generateReportBlock", requireUserToLogin, QuestionnaireContorller.apiGenerateReportBlock as any)
router.post("/answer/:questionId", requireUserToLogin, QuestionnaireContorller.apiProvideAnswers as any)
router.post("/answer", requireUserToLogin, QuestionnaireContorller.apiProgressProvideAnswers)

export = router
