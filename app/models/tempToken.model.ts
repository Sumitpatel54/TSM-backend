import mongoose from 'mongoose'

const TempTokenSchema = new mongoose.Schema({
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
    required: true
  }
})

// Index to automatically delete expired tokens
TempTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const TempToken = mongoose.model('TempToken', TempTokenSchema)

export default TempToken
