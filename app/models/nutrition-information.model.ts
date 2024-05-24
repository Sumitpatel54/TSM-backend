import mongoose from "mongoose"
import mongoosePaginate from "mongoose-paginate"

import { NutritionInformationDocument } from "../interfaces/nutrition-information.interface"

const nutritionInformationSchema = new mongoose.Schema(
    {
        information: {
            type: String
        }
    }
)

nutritionInformationSchema.plugin(mongoosePaginate)

export default mongoose.model<NutritionInformationDocument>("NutritionInformation", nutritionInformationSchema)
