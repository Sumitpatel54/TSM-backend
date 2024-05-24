import mongoose from "mongoose"

export interface UserDocument extends mongoose.Document {
  id?: string
  email: string
  password: string
  isActive: boolean
  isDeleted: boolean
  loginSecure: boolean
  role: string
  createdAt: Date
  updatedAt: Date
  firstName: string
  lastName: string
  age: number
  questionnaireAnswers: Object
  reportBlock: Object
  isVerified: boolean
  facebook: Object
  google: Object
  method: string
  isPaid: boolean
  stripeCustomerId: string
  bmiAfter30Data: Object
  bmiAfter60Data: Object
  bmiAfter90Data: Object
  questionnaireAnswersAfter30Days: Object
  reportBlockAfter30Days: Object
  questionnaireAnswersAfter60Days: Object
  reportBlockAfter60Days: Object
}

