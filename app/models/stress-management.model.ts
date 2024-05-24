import mongoose from "mongoose"
import mongoosePaginate from "mongoose-paginate"

import { StressManagementDocument } from "../interfaces/stress-management.interface"

const streeManagementSchema = new mongoose.Schema(
    {
        categoryName: {
            type: String,
            required: true,
            unique: true,
        },
        title: {
          type: String
        }
    }
)

streeManagementSchema.plugin(mongoosePaginate)

export default mongoose.model<StressManagementDocument>("StressManagement", streeManagementSchema)
