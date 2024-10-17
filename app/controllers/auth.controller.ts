/* eslint-disable unused-imports/no-unused-imports */
/* eslint-disable no-trailing-spaces */
/* eslint-disable semi */
/* eslint-disable unused-imports/no-unused-vars */
import { NextFunction, Request, Response } from "express"
import HttpStatusCode from "http-status-codes"
import { suid } from 'rand-token'
import validator from 'validator'
import User from '../models/user.model'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'

// import config from "../configurations/config"
import { UserDocument } from "../interfaces/user.interface"
import { createAccessToken } from "../services/auth.service"
import UserService from "../services/user.service"
import { generateRefreshToken } from "../services/userToken"
import commonUtilitie from "../utilities/common"
import { sendEmail, sendEmailVerification } from "../utils/email.util"
import config from '../configurations/config'



// import passport from "passport"
// import { IVerifyOptions } from "passport-local"

// import "../config/passport"
// import HttpException from "../exceptions/HttpException"
// import { AdminDocument } from "../interfaces/admin.interface"
// import RequestWithAdmin from "../interfaces/requestWithAdmin"
// import { refreshToken as refreshToken1, removeAllTokens } from "../services/adminAuth"
// import { generateRefreshToken } from "../services/adminToken"
// import { sign } from "../utils/jwt.util"

interface MyUserRequest extends Request {
  user?: any;
}

/**
 * Used to check login credentials of admin and generate access token
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */

const apiAdminLogin = async (req: Request, res: Response, _next: NextFunction) => {

  const payload: any = req.body ? req.body : undefined

  const loginSecure = suid(50)
  const findAdminResponse: any = await UserService.findUser({ 'email': payload.email })
  await UserService.updateUser(findAdminResponse.id, { 'loginSecure': loginSecure })

  //remove the static url and replce it with frontend admin dashboard url
  const templateData = {
    url: `https://${process.env.ADMIN_DASHBOARD_HOSTNAME}/auth/checkAuthentication/${payload.email}/${loginSecure}`
  }

  const subject = `Verify your account`
  const to = payload.email
  const from = {
    email: process.env.SENDGRID_FROM_EMAIL,
    name: "Cure Migraine"
  }
  const html = `
  <p>Hi</p>
  <p>Please click on the following <a href="${templateData.url}">link</a> to verify your account.</p> 
  <p>If you did not request this, please ignore this email.</p>`

  await sendEmail({ to, from, subject, html })

  // Send template
  //remove the static sender id and replce it with payload.email
  // const res_ = await sendTemplate(payload.email, "Admin Verify Authentication", config.sendGrid.VERIFY_ADMIN_TEMPLATE, templateData)

  // console.log("res_", res_)

  return res.status(200).send({
    status: true,
    message: "Login Success, Check Mail for Authentication Link"
  })

}

/**
 * @summary - Resend admin login email API required
 * @param req
 * @param res
 * @param _next
 * @returns
 */
const resendApiAdminLogin = async (req: Request, res: Response, _next: NextFunction) => {

  const payload: any = req.body ? req.body : undefined

  const findAdminResponse: any = await UserService.findUser({ 'email': payload.email })
  const loginSecure = findAdminResponse.loginSecure

  if (!loginSecure) {
    return res.status(HttpStatusCode.BAD_REQUEST).send({
      status: false,
      message: `Kindly login again.`
    })
  }

  const templateData = {
    url: `https://${process.env.ADMIN_DASHBOARD_HOSTNAME}/auth/checkAuthentication/${payload.email}/${loginSecure}`
  }

  const subject = `Verify your account`
  const to = payload.email
  const from = {
    email: process.env.SENDGRID_FROM_EMAIL,
    name: "Cure Migraine"
  }
  const html = `
  <p>Hi</p>
  <p>Please click on the following <a href="${templateData.url}">link</a> to verify your account.</p> 
  <p>If you did not request this, please ignore this email.</p>`

  await sendEmail({ to, from, subject, html })

  return res.status(200).send({
    status: true,
    message: "Email sent successfully."
  })
}

/**
 * @summary - Forgot password
 * @param req
 * @param res
 * @returns
 */
const forgetPassword = async (req: Request, res: Response) => {
  let statusCode = 500

  try {
    const { email } = req.body
    if (!email) {
      statusCode = 400
      throw new Error("'email' is required.")
    }

    const user: any = await UserService.findUser({ email })

    if (!user) {
      statusCode = 400
      throw new Error(`The email: ${email} is not associated with any account`)
    }

    // Generate and set password reset token
    user.generatePasswordReset()

    // Send email
    let subject = `Password change request`
    let to = user.email
    let from = {
      email: process.env.SENDGRID_FROM_EMAIL,
      name: "Cure Migraine"
    }
    let link = `${config.API_URL}/reset-password/${user.resetPasswordToken}`
    let html = `
    <p>Hi ${user.firstName},</p>
    <p>No stress! Remembering passwords can be pain in the neck - which for some is a trigger and for some it is a symptom of migraine. Let’s get you back on track so you can continue your journey to a migraine-free life.</p>
    <p>Click the link below to reset your password:</p>
    <a href="${link}">${link}</a>
    <p>Remember, passwords are like toothbrushes – you should change them often and never share them with anyone else!</p>
    <p>Cheers,
    <br>
    The Scandinavian Method Team
    </p>
    `

    await sendEmail({ to, from, subject, html })


    // Save the updated user object
    await user.save()

    return res.status(200).json({
      message: `A reset password email has been sent to ${user.email}`
    })
  } catch (error: any) {
    // console.log(error.message)
    return res.status(statusCode).json({
      success: false,
      error: {
        code: statusCode,
        rawErrorMessage: error.response?.data?.message || "An error has occurred"
      },
      message: error.message || "An error has occurred"
    })
  }
}

/**
 * @summary - Reset password
 * @param req
 * @param res
 * @returns
 */
const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params

    const user: any = await UserService.findUser({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    })

    if (!user)
      return res
        .status(401)
        .json({ message: `Password reset token is invalid or has expired. Please try again` })

    // set the new password
    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    user.isVerified = true

    // save the updated user
    await user.save()

    // Send a password successfully reset confirmation email
    let subject = 'Your password has been changed'
    let to = user.email
    let from = {
      email: "no-reply@davigate.com",
      name: "Davigate"
    }
    let html = `
    <br />
    <p>Hi ${user.firstName},</p>
    <p>This is a confirmation that the password for your account ${user.email} has just been changed.</p>
    <p>If you did not ask to make this change, please contact <a href="mailto:support@davigate.com" style="color:blue;">support@davigate.com</a> immediately.</p>`

    await sendEmail({ to, from, subject, html })

    res.status(200).json({ status: true, message: `Your password has been updated` })
  } catch (error: any) {
    return res.status(500).send({
      status: false,
      message: error.message
    })
  }
}

const apiCheckAuthentication = async (req: Request, res: Response, _next: NextFunction) => {
  const email: any = req.params.email?.toString()
  const loginSecure: any = req.params.loginSecure?.toString()

  const admin: any = await UserService.findUser({ 'email': email })

  if (!admin) {
    return res.status(HttpStatusCode.BAD_REQUEST).send({
      status: false,
      message: "Admin not found by Given Email"
    })
  }

  // console.log(admin.loginSecure)

  if (admin.loginSecure === loginSecure) {
    //delete admin.loginSecure
    //generate token here and pass forward
    const tokens: Object = await generateAccessTokenAndRefreshToken(admin, req)
    // console.log("tokens", tokens)
    delete admin._doc.loginSecure
    return res.status(HttpStatusCode.OK).send({
      status: true,
      data: {
        ...admin._doc,
        ...tokens
      },
      message: "Logged-in successful"
    })

  } else {
    return res.status(HttpStatusCode.BAD_REQUEST).send({
      status: false,
      message: "Authentication Failed"
    })
  }


}

const apiCheckAuthenticationUser = async (req: Request, res: Response, _next: NextFunction) => {
  const email: any = req.params.email?.toString()

  const admin: any = await UserService.findUser({ 'email': email })

  if (admin) {
    // Update isVerified to true
    admin.isVerified = true
    await admin.save()

    // Generate token here and pass forward
    const tokens: Object = await generateAccessTokenAndRefreshToken(admin, req)
    delete admin._doc.loginSecure
    return res.status(HttpStatusCode.OK).send({
      status: true,
      data: {
        ...admin._doc,
        ...tokens
      },
      message: "Logged-in successful"
    })
  } else {
    return res.status(HttpStatusCode.BAD_REQUEST).send({
      status: false,
      message: "Authentication Failed"
    })
  }
}

/**
 * Used to generate access token and refresh token
 *
 * @param user
 * @returns object
 */
const generateAccessTokenAndRefreshToken = async (user: UserDocument, req: Request) => {
  const issuer = req.headers["host"]
  // console.log("issuer", issuer)

  // Create Access Token
  const accessToken = createAccessToken({ user, issuer })
  const newRefreshToken: any = await generateRefreshToken(user, req.ip)

  return { accessToken, refreshToken: newRefreshToken.token }
}


/**
 * @summary - Register's a user
 * @param {*} req
 * @param {*} res
 * @returns
 */
const register = async (req: Request, res: Response) => {
  let statusCode = 500

  try {
    let user
    const { email, password, firstName, lastName, age } = req.body

    // validate request
    commonUtilitie.validateRequestForEmptyValues({ email, password, firstName, lastName, age })

    // validate email
    if (!validator.isEmail(email)) {
      statusCode = 400
      throw new Error("Email is invalid.")
    }

    // validate password
    if ((password.length < 8) || (!/\d/.test(password))) {
      statusCode = 400
      throw new Error("Password must be at least 8 characters long and must contain a combination of letters and numbers.")
    }

    // check if account doesn't already exists
    user = await UserService.findUser({ email })

    if (user) {
      statusCode = 400
      throw new Error(`The email address ${email} already exists.`)
    }

    // save user to mongo db
    const user_ = await UserService.createUser({ email, password, firstName, lastName, age: Number(age), role: "patient" })

    // send email verification
    await sendEmailVerification(user_, req)

    return res.status(200).json({
      status: true,
      data: {
        message: `A verification email has been sent to ${firstName} `
      },
      message: "Patient Record Created"
    })
  } catch (error: any) {
    res.status(statusCode).json({ status: false, message: error.message })
  }
}

const resendEmail = async (req: Request, res: Response) => {
  let statusCode = 500
  try {
    let user
    const { email } = req.body

    // validate request
    commonUtilitie.validateRequestForEmptyValues({ email })

    // validate email
    if (!validator.isEmail(email)) {
      statusCode = 400
      throw new Error("Email is invalid.")
    }

    // check if account doesn't already exists
    user = await UserService.findUser({ email })

    // send email verification
    await sendEmailVerification(user, req)

    return res.status(200).json({
      status: true,
      data: {
        message: `A verification email has been sent to ${user?.firstName} `
      }
    })
  } catch (error: any) {
    res.status(statusCode).json({ status: false, message: error.message })
  }
}

/**
 * @summary - Verify registration token
 * @param req
 * @param res
 */
const verifyRegistrationToken = async (req: Request, res: Response) => {
  let _statusCode = 500

  try {
    // validate request
    commonUtilitie.validateRequestForEmptyValues({ token: req.params.token })

    // Find  match token
    const token = await UserService.findToken({ token: req.params.token })
    if (!token) {
      _statusCode = 400
      throw new Error(`Unable to find a valid token, your token might have expired`)
    }

    // If there is a token, find a matching user
    let user = await UserService.findUser({ _id: token.userId })
    if (!user) {
      return res.status(400).json({ success: false, msg: `Unable to find a user for this token` })
    }

    // check if user is verified
    if (user.isVerified) {
      _statusCode = 400
      throw new Error(`This user has already been verified.`)
    }

    // verify and save the user
    user.isVerified = true

    user.save((err) => {
      if (err) {
        return res.status(500).json({ status: false, message: err.message })
      }

      // res.status(200).send(`The account has been verified, please Log In`)
      res.status(301).redirect(`${config.API_URL}/login`)
    })
  } catch (error: any) {
    // res.status(statusCode).json({ status: false, message: error.message })
    res.status(301).redirect(`${config.API_URL}/login`)
  }
}



const facebookOAuth = async (req: MyUserRequest, res: Response) => {
  let statusCode = 500

  try {
    if (!req.user) {
      statusCode = 401
      throw new Error('User not authenticated')
    }

    const token: any = req.user?.generateJWT()

    return res.header("auth-token", token).status(200).json({
      status: true,
      data: {
        token,
        user: req.user
      }
    })
  } catch (error: any) {
    res.status(statusCode).json({ status: false, message: error.message })
  }
}

/**
 * @summary - Login a patient
 * @param {*} req
 * @param {*} res
 * @returns
 */
const login = async (req: Request, res: Response) => {
  let statusCode = 500

  try {
    let user: any
    const { email, password } = req.body

    // check if the current user exist
    try {
      user = await UserService.findUser({ email })
    }
    catch (err) {
      // do nothing
    }

    if (!user) {
      statusCode = 400
      throw new Error("You're not a registered user.")
    }

    // validate the password
    if (!user.comparePassword(password)) {
      statusCode = 400
      throw new Error(`Invalid email or password`)
    }

    // make sure the user has been verified
    if (!user.isVerified) {
      statusCode = 400
      throw new Error(`Your account has not been verified`)
    }

    // Login successful, write toke, and send back user
    let token = user.generateJWT()

    return res.header("auth-token", token).status(200).json({
      status: true,
      data: {
        token,
        user
      }
    })
  } catch (error: any) {
    res.status(statusCode).json({ status: false, message: error.message })
  }
}

// const googleAuth = async (req: Request, res: Response) => {

//   // return res.status(200).json({ success: true, msg: `Hello` })
//   try {
//     passport.use(
//       new GoogleStrategy(
//         {
//           clientID: config.GOOGLE_OAUTH_CREDENTIALS.CLIENT_ID!,
//           clientSecret: config.GOOGLE_OAUTH_CREDENTIALS.CLIENT_SECRET!,
//           callbackURL: 'http://localhost:3000/api/auth/callback/google',
//         },
//         async (accessToken: any, refreshToken: any, profile: any, done: any) => {
//           // passport callback function
//           console.log("calling google api ========")
//           const {
//             id: googleId,
//             displayName: username,
//             _json
//           } = profile

//           const user = {
//             googleId,
//             username,
//             firstName: _json.given_name,
//             lastName: _json.family_name,
//             photo: _json.picture,
//             email: _json.email,
//           }

//           console.log('user ==', user)

//           const existingUser = await User.findOne({ 'google.id': googleId })

//           console.log('existingUser ==', existingUser)
//           if (existingUser) {
//             return done(null, existingUser)
//           }

//           const newUser = new User({
//             method: 'google',
//             email: user.email,
//             firstName: user.firstName,
//             lastName: user.lastName,
//             google: {
//               id: googleId,
//               token: accessToken
//             },
//             isVerified: true,
//             isActive: true
//           })

//           await newUser.save()
//           console.log('newUser ==', newUser)
//           done(null, newUser)
//           return res.status(200).json({ success: true, data: newUser, msg: `Hello` })
//         }))

//     passport.serializeUser((user: any, done) => {
//       // calling done method once we get the user from the db
//       done(null, user?.google?.id)
//     })

//     passport.deserializeUser((id, done) => {
//       User.findOne({ '_id': id })
//         .then(currentUser => {
//           // calling done once we've found the user
//           done(null, currentUser)
//         })
//     })
//   } catch (error: any) {
//     console.log('Error in google Auth ==', error)
//     res.status(500).json({ status: false, message: error.message })
//   }

// }


// setting up our serialize and deserialize methods from passport
// passport.serializeUser((user: any, done) => {
//   // calling done method once we get the user from the db
//   done(null, user?.google?.id)
// })

// passport.deserializeUser((id, done) => {
//   User.findOne({ '_id': id })
//     .then(currentUser => {
//       // calling done once we've found the user
//       done(null, currentUser)
//     })
// })

// setting up our Google Strategy when we get the profile info back from Google
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: config.GOOGLE_OAUTH_CREDENTIALS.CLIENT_ID!,
//       clientSecret: config.GOOGLE_OAUTH_CREDENTIALS.CLIENT_SECRET!,
//       callbackURL: 'http://localhost:8000/auth/google/callback',
//     },
//     async (accessToken: any, refreshToken: any, profile: any, done: any) => {
//       // passport callback function
//       console.log("calling google api ========")
//       const {
//         id: googleId,
//         displayName: username,
//         _json
//       } = profile

//       const user = {
//         googleId,
//         username,
//         firstName: _json.given_name,
//         lastName: _json.family_name,
//         photo: _json.picture,
//         email: _json.email,
//       }

//       console.log('user ==', user)

//       const existingUser = await User.findOne({ 'google.id': googleId })

//       console.log('existingUser ==', existingUser)
//       if (existingUser) {
//         return done(null, existingUser)
//       }

//       const newUser = new User({
//         method: 'google',
//         email: user.email,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         google: {
//           id: googleId,
//           token: accessToken
//         },
//         isVerified: true,
//         isActive: true
//       })

//       await newUser.save()
//       console.log('newUser ==', newUser)
//       done(null, newUser)
//     }))

// const googleAuth = async (req: Request, res: Response) => {
//   try {
//     // This function can now just call the passport.authenticate middleware
//     passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, (err:any) => {
//       if (err) {
//         return res.status(500).json({ status: false, message: err.message });
//       }
//       // Handle successful authentication here if needed
//     });
//     passport.serializeUser((user: any, done) => {
//       // calling done method once we get the user from the db
//       done(null, user?.google?.id)
//     })
    
//     passport.deserializeUser((id, done) => {
//       User.findOne({ '_id': id })
//         .then(currentUser => {
//           // calling done once we've found the user
//           done(null, currentUser)
//         })
//     })
//   } catch (error: any) {
//     console.log('Error in google Auth ==', error);
//     res.status(500).json({ status: false, message: error.message });
//   }
// };


// export const googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

// export const googleAuthCallback = (req: Request, res: Response) => {
//   passport.authenticate('google', { failureRedirect: '/login' }, (err, user, info) => {
//     if (err) {
//       return res.status(500).json({ success: false, message: 'Authentication failed' });
//     }
//     if (!user) {
//       return res.status(401).json({ success: false, message: 'User not found' });
//     }
//     const token = user.generateJWT();
//     res.json({ success: true, token, user });
//   })(req, res);
// };

export default { apiAdminLogin, resetPassword, forgetPassword, apiCheckAuthentication, apiCheckAuthenticationUser, resendApiAdminLogin, register, verifyRegistrationToken, login, facebookOAuth, resendEmail }
