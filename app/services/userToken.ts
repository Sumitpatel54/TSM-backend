import crypto from "crypto"

import { UpdateQuery, FilterQuery } from "mongoose"

import { UserTokenDocument, UserTokenPopulatedDocument } from "../interfaces/userToken.interface"
import UserToken from "../models/tokenUser.model"

export const findToken = async (query: FilterQuery<UserTokenDocument>): Promise<UserTokenPopulatedDocument> => {
  const refreshToken = await UserToken.findOne(query).populate("user").exec()

  if (!refreshToken || !refreshToken.isActive) {
    throw new Error("Invalid Token")
  }

  return refreshToken
}

const randomTokenString = () => {
  return crypto.randomBytes(40).toString("hex")
}

export const generateRefreshToken = async (user: any, ipAddress: any): Promise<UserTokenDocument> => {
  const userToken = await new UserToken({
    user: user._id,
    token: randomTokenString(),
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdByIp: ipAddress
  }).save()
  return userToken
}

export const updateToken = async (
  userTokenId: string,
  tokenData: UpdateQuery<UserTokenDocument>
): Promise<UserTokenDocument> => {
  const userToken = await UserToken.findByIdAndUpdate(userTokenId, tokenData, { new: true })
  if (!userToken) {
    throw new Error("Invalid Token")
  }
  return userToken
}
