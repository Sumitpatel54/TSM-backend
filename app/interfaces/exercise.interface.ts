import mongoose from "mongoose"

export interface ExerciseDocument extends mongoose.Document {
  title: string
  tags: []
}
