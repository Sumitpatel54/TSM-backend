import jwt from "jsonwebtoken"
import { LeanDocument } from "mongoose"

import config from "../configurations/config"
import { UserDocument } from "../interfaces/user.interface"
import { sign } from "../utils/jwt.util"

/**
 * Used to check access allowed to specific audience
 * @param audience
 * @returns Boolean
 */
export function createAccessToken({
  user,
  issuer
}: {
  user: Omit<UserDocument, "password"> | LeanDocument<Omit<UserDocument, "password">>
  issuer: string | undefined
}) {
  const options = {
    expiresIn: config.jwt.accessTokenExpiresIn,
    algorithm: "HS256"
  } as jwt.SignOptions

  if (typeof issuer !== "undefined") {
    Object.assign(options, { issuer })
  }

  // BUild and return new accessToken
  return sign({ sub: `${user._id}`, id: `${user._id}`, role: user.role }, options)
}
