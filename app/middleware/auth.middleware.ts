import HttpStatusCode from "http-status-codes"
import * as jwt from "jsonwebtoken"
import { get } from "lodash"

import { Response, NextFunction } from "../interfaces/express.interface"
import RequestWithUser from "../interfaces/requestWithUser"
import UserService from "../services/user.service"
import { decode } from "../utils/jwt.util"

const verifyToken = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const header = req.headers["authorization"]
  const issuer = req.headers["host"]

  if (typeof header === "undefined") {
    return res.status(HttpStatusCode.FORBIDDEN).json({ status: false, message: "Un-authorized" })
  }

  const bearer = header.split(" ")
  const token = bearer[1]

  let verifyOptions = {
    algorithm: ["RS256"]
  } as jwt.VerifyOptions

  if (typeof issuer !== "undefined") {
    Object.assign(verifyOptions, { issuer })
  }

  const { decoded } = decode(token)

  if (!decoded || !get(decoded, "id")) {
    return res.status(HttpStatusCode.FORBIDDEN).json({ status: false, message: "Un-authorized" })
  }

  const userId = get(decoded, "id")

  const user = await UserService.findUser({ _id: userId })

  if (!req.user && user) {
    req.user = user
  }

  next()
}

export { verifyToken }
