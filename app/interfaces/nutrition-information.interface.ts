import mongoose from "mongoose"

export interface NutritionInformationDocument extends mongoose.Document {
  information: string
}

