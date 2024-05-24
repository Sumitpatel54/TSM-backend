import mongoose from "mongoose"
import mongoosePaginate from "mongoose-paginate"
import aggregatePaginate from "mongoose-aggregate-paginate-v2"

import { StressManagementDetailDocument } from "../interfaces/stress-management-detail.interface"

const streeManagementSchema = new mongoose.Schema(
  {
    categoryId: {
      type: String,
      required: true
    },
    categoryName: {
      type: String,
      required: true
    },
    title: {
      type: String,
    },
    video: String,
    image: String,
    description: String,
  }
)

streeManagementSchema.plugin(mongoosePaginate)

streeManagementSchema.plugin(aggregatePaginate)

streeManagementSchema.index({
  categoryName: "text",
  description: "text",
  title: "text"
})

export default mongoose.model<StressManagementDetailDocument>("StressManagementDetail", streeManagementSchema)
