import mongoose from "mongoose"

export interface NutritionExamplesDocument extends mongoose.Document {
  categoryName: string,
}
