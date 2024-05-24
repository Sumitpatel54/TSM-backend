import mongoose from "mongoose"

export interface ExerciseListDocument extends mongoose.Document {
  title: string
  description: string
  day: []
  tagId: string
  tag: string
  exerciseParentId: string
  exerciseParentName: string
  video: string
}
