/* eslint-disable no-trailing-spaces */
/* eslint-disable semi */
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
// router.post('/login', AuthController.login)  // TODO: Implement login function if needed

router.post('/forgot-password', AuthController.forgetPassword)
router.post('/reset-password/:token', AuthController.resetPassword)
router.post('/facebook', passport.authenticate('facebookToken', { session: false }), AuthController.facebookOAuth)
router.get('/verify/:token', AuthController.verifyRegistrationToken)

router.post('/google-signin', AuthController.googleSignIn)

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

router.get('/callback/google',
  passport.authenticate('google', { failureRedirect: '/login' }),
  AuthController.googleCallback
);

router.get('/google-user-data', AuthController.getGoogleUserData);

// router.get('/callback/google', passport.authenticate('google', { failureRedirect: '/login' }),
//   (req: any, res: { redirect: (arg0: string) => void }) => {
//     let frontendURL = 'http://localhost:3000';
//     res.redirect(`${frontendURL}/home`);
//   }
// );



// router.get('/callback/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
// router.get('/callback/google', passport.authenticate('google'), (_req, res) => {
//     // will redirect once the request has been handled
//     res.redirect(`http://${process.env.FRONTEND_HOSTNAME}/`)
// })



export = router
