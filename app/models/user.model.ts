import crypto from "crypto"

import bcrypt from 'bcryptjs'
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import mongoosePaginate from "mongoose-paginate"

import { UserDocument } from "../interfaces/user.interface"
import Token from "../models/token.model"

/**
 * UserSchema for the database
 */
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      length: 150,
      required: true
    },
    password: {
      type: String,
      required: false
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    age: {
      type: Number
    },
    isQuestionnaireDone: {
      type: Boolean,
      default: false
    },
    bmiData: {
      type: Object
    },
    bmiAfter30Data: {
      type: Object
    },
    bmiAfter60Data: {
      type: Object
    },
    bmiAfter90Data: {
      type: Object
    },
    google: {
      id: {
        type: String
      },
      token: {
        type: String
      }
    },
    facebook: {
      id: {
        type: String
      },
      email: {
        type: String
      },
      token: {
        type: String
      },
      select: false
    },
    method: {
      type: String,
      enum: ["email", "facebook", "google", "apple"],
    },
    isActive: {
      type: Boolean,
      required: false
    },
    isPaid: {
      type: Boolean,
      required: false,
      default: false
    },
    exerciseStartDate: {
      type: Date
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    loginSecure: {
      type: String,
      required: false
    },
    role: {
      type: String,
      enum: ["admin", "patient"],
      required: false
    },
    resetPasswordToken: {
      type: String
    },
    resetPasswordExpires: {
      type: Date
    },
    reportBlock: {},
    questionnaireAnswers: {},
    reportBlockAfter30Days: {},
    questionnaireAnswersAfter30Days: {},
    reportBlockAfter60Days: {},
    questionnaireAnswersAfter60Days: {},
    reportBlockAfter90Days: {},
    questionnaireAnswersAfter90Days: {},
    stripeCustomerId: {
      type: String
    },
    completedSections: { type: Number, default: 0 },
  },
  {
    timestamps: true
  }
)

userSchema.pre('save', function (next) {
  const user = this

  if (!user.isModified('password')) return next()

  if (user.password) {
    bcrypt.genSalt(10, function (err, salt) {
      if (err) return next(err)

      bcrypt.hash(user.password || "", salt, function (err, hash) {
        if (err) return next()

        user.password = hash
        next()
      })
    })
  }
})

userSchema.methods.comparePassword = function (password: any) {
  return bcrypt.compareSync(password, this.password)
}

userSchema.methods.generateJWT = function () {
  const today = new Date()
  const expirationDate = new Date(today)
  expirationDate.setDate(today.getDate() + 60)

  let payload = {
    id: this._id,
    email: this.email,
    role: this.role
  }

  // expire in 2 weeks
  return jwt.sign(payload, process.env.JWT_SECRET || "", {
    expiresIn: "14 days"
  })
}

userSchema.methods.generatePasswordReset = function () {
  this.resetPasswordToken = crypto.randomBytes(20).toString('hex')
  this.resetPasswordExpires = Date.now() + 3600000 // expires in 1hr
}

userSchema.methods.generateVerificationToken = function () {
  let payload = {
    userId: this._id,
    token: crypto.randomBytes(20).toString('hex')
  }
  return new Token(payload)
}

userSchema.set('toJSON', {
  transform: function (_doc, ret, _options) {
    delete ret.loginSecure
    return ret
  }
})

userSchema.plugin(mongoosePaginate)

export default mongoose.model<UserDocument>("User", userSchema)
