// # FILE: app/middleware/optionalAuth.middleware.ts
// # REASON: This middleware checks for an auth token. 
// # If a valid token exists, it adds the user to req.user. 
// # If no token exists, it continues without error, allowing guest checkout.

import HttpStatusCode from "http-status-codes"
import * as jwt from "jsonwebtoken" // # CHANGE: Added "* as" to fix "no default export" build error.
import { get } from "lodash"

import { Response, NextFunction } from "../interfaces/express.interface"
import RequestWithUser from "../interfaces/requestWithUser"
import UserService from "../services/user.service"
import { decode } from "../utils/jwt.util"

const optionalAuth = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const header = req.headers["authorization"]
  const issuer = req.headers["host"]

  // If no header, just continue. User is a guest.
  if (typeof header === "undefined") {
    return next()
  }

  const bearer = header.split(" ")
  const token = bearer[1]

  if (!token) {
    return next() // No token, continue as guest
  }

  let verifyOptions = {
    algorithm: ["RS256"]
  } as jwt.VerifyOptions

  if (typeof issuer !== "undefined") {
    Object.assign(verifyOptions, { issuer })
  }

  const { decoded } = decode(token)

  // If token is invalid or missing ID, continue as guest
  if (!decoded || !get(decoded, "id")) {
    return next()
  }

  const userId = get(decoded, "id")

  try {
    const user = await UserService.findUser({ _id: userId })
    if (user) {
      req.user = user // Add user to the request
    }
  } catch (error) {
    // Something went wrong (e.g., invalid token), but we don't block.
  }
  
  next()
}

export { optionalAuth }
