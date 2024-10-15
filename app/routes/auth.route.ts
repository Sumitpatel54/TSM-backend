import express from "express"
import passport from "passport"

import AuthController from "../controllers/auth.controller"
import checkEmailNotExists from "../middleware/checkEmailNotExists"
import comparePassword from "../middleware/comparePassword"
const router = express.Router()

router.post("/adminLogin", checkEmailNotExists as any, comparePassword as any, AuthController.apiAdminLogin)
router.post("/resendAdminLogin", checkEmailNotExists as any, AuthController.resendApiAdminLogin)
router.get("/checkAuthentication/:email/:loginSecure", AuthController.apiCheckAuthentication)
router.get("/checkAuthentication/:email", AuthController.apiCheckAuthenticationUser)

// patient auth
router.post("/register", AuthController.register)
router.post("/resend-email", AuthController.resendEmail)
router.post('/login', AuthController.login)
// router.post('/google', AuthController.googleAuth)
// router.get('/google/callback', AuthController.googleAuthCallback)

router.post('/forgot-password', AuthController.forgetPassword)
router.post('/reset-password/:token', AuthController.resetPassword)
router.post('/facebook', passport.authenticate('facebookToken', { session: false }), AuthController.facebookOAuth)
router.get('/verify/:token', AuthController.verifyRegistrationToken)
router.get('/google', passport.authenticate('google', { scope: ['profile','email'] }))
router.get('/googleRedirect', passport.authenticate('google', { scope: ['profile','email'] }))
router.get('/googleRedirect', passport.authenticate('google'), (_req, res) => {
    // will redirect once the request has been handled
    res.redirect(`http://localhost:3000/api/auth/callback/google`)
    // res.redirect(`http://${process.env.FRONTEND_HOSTNAME}/api/auth/callback/google`)
})

export = router
