import mongoose from "mongoose"

import { UserTokenDocument } from "../interfaces/userToken.interface"

/**
 * UserSchema for the database
 */
const userTokenSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    token: String,
    expires: Date,
    created: { type: Date, default: Date.now },
    createdByIp: String,
    revoked: Date,
    revokedByIp: String,
    replacedByToken: String
  },
  {
    timestamps: true
  }
)

function tokenIsExpired(date: Date): boolean {
  return Date.now() >= date.getTime()
}

userTokenSchema.virtual("isExpired").get(function () {
  return this.expires ? tokenIsExpired(this.expires) : true
})

userTokenSchema.virtual("isActive").get(function () {
  const expired: boolean = this.expires ? tokenIsExpired(this.expires) : true

  return !this.revoked && !expired
})

userTokenSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc: any, ret: any) => {
    delete ret._id
    delete ret.id
    delete ret.user
  }
})

export default mongoose.model<UserTokenDocument>("UserToken", userTokenSchema)
