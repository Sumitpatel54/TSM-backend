import mongoose from 'mongoose'

const tempTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  userData: {
    type: Object,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    expires: 900 // 15 minutes in seconds
  }
}, { timestamps: true })

const TempToken = mongoose.model('TempToken', tempTokenSchema)

export default TempToken
