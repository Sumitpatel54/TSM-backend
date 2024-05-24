import mongoose from "mongoose"

export interface ProgramDocument extends mongoose.Document {
    templates: []
    userId: string
}
