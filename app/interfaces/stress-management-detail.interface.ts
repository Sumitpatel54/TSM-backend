import mongoose from "mongoose"

export interface StressManagementDetailDocument extends mongoose.Document {
  categoryId: string,
  categoryName: string,
  title: string,
  video: string,
  image: string,
  description: string
}
