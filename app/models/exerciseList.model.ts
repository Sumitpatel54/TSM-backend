import mongoose from "mongoose"
import mongoosePaginate from "mongoose-paginate"
import aggregatePaginate from "mongoose-aggregate-paginate-v2"

import { ExerciseListDocument } from "../interfaces/exerciseList.interface"

/**
 * ExerciseListSchema for the database
 */
const exerciseListSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
        },
        video: {
            type: String,
        },
        day: [],
        tag: [],
        tagId: {
            type: [],
            required: true
        },
        exerciseParentId: {
            type: String,
            required: true
        },
        exerciseParentName: {
            type: String,
        }
    },
    {
        timestamps: true
    }
)

exerciseListSchema.plugin(mongoosePaginate)

exerciseListSchema.plugin(aggregatePaginate)

exerciseListSchema.index({
    title: "text",
    description: "text"
})

export default mongoose.model<ExerciseListDocument>("ExerciseList", exerciseListSchema)
