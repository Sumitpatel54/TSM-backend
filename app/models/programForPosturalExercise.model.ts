import mongoose from "mongoose"
import mongoosePaginate from "mongoose-paginate"

import { ProgramForPosturalExerciseDocument } from "../interfaces/programForPosturalExercise.interface"

const programForPosturalExerciseSchema = new mongoose.Schema(
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

programForPosturalExerciseSchema.plugin(mongoosePaginate)

export default mongoose.model<ProgramForPosturalExerciseDocument>("Programforposturalexercises", programForPosturalExerciseSchema)
