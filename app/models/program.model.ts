import mongoose from "mongoose"
import mongoosePaginate from "mongoose-paginate"

import { ProgramDocument } from "../interfaces/program.interface"

/**
 * ProgramSchema for the database
 */
const programSchema = new mongoose.Schema(
    {
        templates: [
            {
                week: {
                    type: Number,
                    required: true
                },
                days: {
                    monday: [],
                    tuesday: [],
                    wednesday: [],
                    thursday: [],
                    friday: [],
                    saturday: [],
                    sunday: [],
                },
            }
        ],
        userId: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
)

programSchema.plugin(mongoosePaginate)

export default mongoose.model<ProgramDocument>("Program", programSchema)
