import mongoose from "mongoose"

export interface ProgramForPosturalExerciseDocument extends mongoose.Document {
    templates: []
    userId: string
}
