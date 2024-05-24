import mongoose from "mongoose"

export interface CategoryDocument extends mongoose.Document {
    id?: string
    name: string
    createdAt: Date
    updatedAt: Date
}

