import mongoose from "mongoose"
import mongoosePaginate from "mongoose-paginate"

import { NutritionInformationDocument } from "../interfaces/nutrition-information.interface"

const exerciseInformationSchema = new mongoose.Schema(
    {
        information: {
            type: String
        }
    }
)

exerciseInformationSchema.plugin(mongoosePaginate)

export default mongoose.model<NutritionInformationDocument>("exerciseInformation", exerciseInformationSchema)
