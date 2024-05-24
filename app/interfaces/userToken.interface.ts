import mongoose from "mongoose"

import { UserDocument } from "./user.interface"

/**
 * UserDocument interface
 */
export interface UserTokenDocument extends mongoose.Document {
  user: UserDocument["_id"]
  token: string
  expires: Date
  createdByIp: string
  revoked: number
  revokedByIp: string
  replacedByToken: string
  createdAt: Date
  updatedAt: Date
  isActive: boolean
  isExpired: boolean
}

export interface UserTokenPopulatedDocument extends UserTokenDocument {
  user: UserDocument
}
