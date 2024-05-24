import mongoose from "mongoose"
import mongoosePaginate from "mongoose-paginate"

import { ExerciseDocument } from "../interfaces/exercise.interface"

/**
 * ExerciseSchema for the database
 */
const exerciseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            unique: true,
            required: true
        },
        tags: [
            {
                title: {
                    type: String,
                }
            }
        ]
    },
    {
        timestamps: true
    }
)

exerciseSchema.plugin(mongoosePaginate)

export default mongoose.model<ExerciseDocument>("Exercise", exerciseSchema)
