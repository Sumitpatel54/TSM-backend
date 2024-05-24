import mongoose from "mongoose"
import mongoosePaginate from "mongoose-paginate"

import { MicroCategoryDocument } from "../interfaces/micro-category.interface"

/**
 * MicroCategorySchema for the database
 */
const microCategorySchema = new mongoose.Schema(
    {
        name: { type: String, unique: true, length: 50, required: true },
        parentId: { type: mongoose.Schema.Types.ObjectId, ref: "SubCategory", required: true }
    },
    {
        timestamps: true
    }
)

microCategorySchema.set('toJSON', {
    transform: function (_doc, ret, _options) {
        delete ret.loginSecure
        return ret
    }
})

microCategorySchema.plugin(mongoosePaginate)

export default mongoose.model<MicroCategoryDocument>("MicroCategory", microCategorySchema)
