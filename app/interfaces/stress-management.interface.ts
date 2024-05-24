import mongoose from "mongoose"

export interface StressManagementDocument extends mongoose.Document {
  categoryName: string
}
