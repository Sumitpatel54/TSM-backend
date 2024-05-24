import mongoose from "mongoose"
import mongoosePaginate from "mongoose-paginate"

import { NutritionExamplesDocument } from "../interfaces/nutrition-examples.interface"

const nutritionExamplesSchema = new mongoose.Schema(
    {
        categoryName: {
            type: String,
            required: true,
            unique: true,
        }
    }
)

nutritionExamplesSchema.plugin(mongoosePaginate)

export default mongoose.model<NutritionExamplesDocument>("NutritionExample", nutritionExamplesSchema)
