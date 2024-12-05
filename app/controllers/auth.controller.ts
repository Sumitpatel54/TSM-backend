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
import GoogleStrategy from "passport-google-oauth20"
// import { Strategy as GoogleStrategy } from 'passport-google-oauth20'

// import config from "../configurations/config"
import { UserDocument } from "../interfaces/user.interface"
import { createAccessToken } from "../services/auth.service"
import UserService from "../services/user.service"
import { generateRefreshToken } from "../services/userToken"
import commonUtilitie from "../utilities/common"
import { sendEmail, sendEmailVerification } from "../utils/email.util"
import config from '../configurations/config'
import { Session } from 'express-session';
import { v4 as uuidv4 } from 'uuid';
import TempToken from '../models/tempToken.model'; // You'll need to create this model



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

// Add this interface at the top of your file
interface CustomSession extends Session {
  passport?: { user: { userId: string, token: string } };
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

interface GoogleUser {
  id: string;
  token: string;
}

passport.use(new GoogleStrategy.Strategy({
  callbackURL: `${config.API_URL}/auth/callback/google`,
  // callbackURL: `http://localhost:8000/auth/callback/google`,
  clientID: config.GOOGLE_OAUTH_CREDENTIALS.CLIENT_ID!,
  clientSecret: config.GOOGLE_OAUTH_CREDENTIALS.CLIENT_SECRET!,
}, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
  try {
    const { id: googleId, _json } = profile

    let user: any
    user = await User.findOne({ 'google.id': googleId })

    if (user) {
      // Update the access token
      (user.google as GoogleUser).token = accessToken;
      await user.save()
    } else {
      // Create a new user
      user = new User({
        method: 'google',
        email: _json.email,
        firstName: _json.given_name,
        lastName: _json.family_name,
        google: {
          id: googleId,
          token: accessToken
        },
        isVerified: true,
        isActive: true,
        role: 'patient'
      })
      await user.save()
    }

    // Login successful, write toke, and send back user
    let token = user.generateJWT()

    // Redirect to frontend with a success parameter
    const frontendURL = 'https://tsm-web.vercel.app'; // Adjust this as needed
    // const frontendURL = 'http://13.61.69.144:8000/'; // Adjust this as needed
    return done(null, { user, token }, { redirectTo: `${frontendURL}/home?googleLoginSuccess=true` });
  } catch (error) {
    return done(error, false);
  }
}))

// // setting up our serialize and deserialize methods from passport
passport.serializeUser((data: any, done) => {
  // We're now receiving { user, token } instead of just user
  if (data && data.user && data.user._id) {
    done(null, { userId: data.user._id, token: data.token })
  } else {
    done(new Error('Invalid user data for serialization'), null)
  }
})

passport.deserializeUser((serializedData: { userId: string, token: string }, done: (err: any, user: any) => void) => {
  User.findById(serializedData.userId)
    .then(user => {
      if (user) {
        done(null, { user, token: serializedData.token })
      } else {
        done(new Error('User not found'), null)
      }
    })
    .catch(err => {
      done(err, null)
    })
})

// Add this at the top of your file
const tempTokens = new Map();

const googleCallback = async (req: Request, res: Response) => {
  console.log('Entering googleCallback function');
  const data = req.user as any;
  console.log('Google callback data:', data);
  if (!data || !data.user || !data.token) {
    console.log('Invalid Google callback data');
    return res.redirect('https://tsm-web.vercel.app/home?error=invalid_data');
  }

  const { user, token } = data;

  try {
    // Generate a temporary token
    const tempToken = uuidv4();
    console.log('Generated temp token:', tempToken);
    
    // Store the user data and token in the database
    const newTempToken = new TempToken({
      token: tempToken,
      userData: { user, token },
      expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes from now
    });
    await newTempToken.save();
    console.log('Stored user data with temp token:', tempToken);

    // Redirect to frontend with the temporary token
    // const frontendURL = 'http://13.61.69.144:8000/';
    const frontendURL = 'https://tsm-web.vercel.app';
    const redirectURL = `${frontendURL}/home?googleToken=${tempToken}`;
    console.log('Redirecting to:', redirectURL);
    res.redirect(redirectURL);
  } catch (error) {
    console.error('Error in googleCallback:', error);
    res.redirect('https://tsm-web.vercel.app/home?error=server_error');
  }
};

const getGoogleUserData = async (req: Request, res: Response) => {
  console.log('Entering getGoogleUserData function');
  const { googleToken } = req.query;
  console.log('Received googleToken:', googleToken);
  
  if (!googleToken || typeof googleToken !== 'string') {
    console.log('Invalid googleToken');
    return res.status(400).json({ error: 'Invalid token' });
  }

  try {
    console.log('Attempting to retrieve userData for token:', googleToken);
    const tempTokenDoc = await TempToken.findOne({ token: googleToken });
    
    if (!tempTokenDoc) {
      console.log('Token not found or expired:', googleToken);
      return res.status(404).json({ error: 'Token not found or expired' });
    }

    const userData = tempTokenDoc.userData;
    console.log('Retrieved userData:', userData);

    // Check if userData has the expected structure
    if (!userData.user || !userData.token) {
      console.log('Invalid userData structure:', userData);
      return res.status(500).json({ error: 'Invalid user data structure' });
    }

    // Delete the temporary token after use
    await TempToken.deleteOne({ token: googleToken });
    console.log('Deleted temp token after use:', googleToken);

    console.log('Successfully retrieved and returning user data');
    res.json(userData);
  } catch (error) {
    console.error('Error retrieving Google user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default { apiAdminLogin, resetPassword, forgetPassword, apiCheckAuthentication, apiCheckAuthenticationUser, resendApiAdminLogin, register, verifyRegistrationToken, login, facebookOAuth, resendEmail, googleCallback, getGoogleUserData }

