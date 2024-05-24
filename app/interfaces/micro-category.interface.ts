import mongoose, { ObjectId } from "mongoose"

export interface MicroCategoryDocument extends mongoose.Document {
    id?: string
    name: string
    parentId: ObjectId
    createdAt: Date
    updatedAt: Date
}
