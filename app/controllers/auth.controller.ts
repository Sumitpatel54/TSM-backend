import { NextFunction, Request, Response } from "express"
import HttpStatusCode from "http-status-codes"
import { suid } from 'rand-token'
import validator from 'validator'

// import config from "../configurations/config"
import { UserDocument } from "../interfaces/user.interface"
import { createAccessToken } from "../services/auth.service"
import UserService from "../services/user.service"
import { generateRefreshToken } from "../services/userToken"
import commonUtilitie from "../utilities/common"
import { sendEmail, sendEmailVerification } from "../utils/email.util"
// import passport from "passport"
// import { IVerifyOptions } from "passport-local"

// import "../config/passport"
// import config from "../config/config"
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
    let link = `https://staging.curemigraine.org/reset-password/${user.resetPasswordToken}`
    let html = `
    <p>Hi ${user.firstName},</p>
    <p>Please click on the following <a href="${link}">link</a> to reset your password.</p> 
    <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`

    await sendEmail({ to, from, subject, html })


    // Save the updated user object
    await user.save()

    return res.status(200).json({
      message: `A reset password email has been sent to ${user.email}`
    })
  } catch (error: any) {
    console.log(error.message)
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

    const user:any = await UserService.findUser({
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
  } catch(error: any) {
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

  console.log(admin.loginSecure)

  if (admin.loginSecure === loginSecure) {
    //delete admin.loginSecure
    //generate token here and pass forward
    const tokens: Object = await generateAccessTokenAndRefreshToken(admin, req)
    console.log("tokens", tokens)
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
  console.log("issuer", issuer)

  // Create Access Token
  const accessToken = createAccessToken({ user, issuer })
  console.log("accessToken", accessToken)
  const newRefreshToken: any = await generateRefreshToken(user, req.ip)
  console.log("newRefreshToken", newRefreshToken)

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
      res.status(301).redirect(`https://staging.curemigraine.org/login`)
    })
  } catch (error: any) {
    // res.status(statusCode).json({ status: false, message: error.message })
    res.status(301).redirect(`https://staging.curemigraine.org/login`)
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

    // removed by sharnam j on 30-5-2023
    // if (user.role === "admin") {
    //   statusCode = 400
    //   throw new Error(`Invalid email or password`)
    // }

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

export default { apiAdminLogin, resetPassword, forgetPassword, apiCheckAuthentication, resendApiAdminLogin, register, verifyRegistrationToken, login, facebookOAuth }
