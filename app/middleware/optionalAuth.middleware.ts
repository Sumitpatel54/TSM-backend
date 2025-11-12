import HttpStatusCode from "http-status-codes"
import jwt from "jsonwebtoken"
import { get } from "lodash"

import { Response, NextFunction } from "../interfaces/express.interface"
import RequestWithUser from "../interfaces/requestWithUser"
import UserService from "../services/user.service"
import { decode } from "../utils/jwt.util"

/**
 * Denne middlewaren sjekker om en bruker ER logget inn,
 * men blokkerer IKKE hvis de ikke er det.
 * Den bare legger til req.user hvis tokenet er gyldig.
 */
const optionalAuth = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const header = req.headers["authorization"]
  const issuer = req.headers["host"]

  // Hvis ingen header, bare fortsett. Brukeren er gjest.
  if (typeof header === "undefined") {
    return next()
  }

  const bearer = header.split(" ")
  const token = bearer[1]

  if (!token) {
    return next() // Ingen token, fortsett som gjest
  }

  let verifyOptions = {
    algorithm: ["RS256"]
  } as jwt.VerifyOptions

  if (typeof issuer !== "undefined") {
    Object.assign(verifyOptions, { issuer })
  }

  const { decoded } = decode(token)

  // Hvis token er ugyldig eller mangler ID, fortsett som gjest
  if (!decoded || !get(decoded, "id")) {
    return next()
  }

  const userId = get(decoded, "id")

  try {
    const user = await UserService.findUser({ _id: userId })
    if (user) {
      req.user = user // Legg til bruker på requesten
    }
  } catch (error) {
    // Noe gikk galt (f.eks. ugyldig token), men vi blokkerer ikke.
    // Vi bare fortsetter som gjest.
  }
  
  next()
}

export { optionalAuth }
