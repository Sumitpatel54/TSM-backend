import mongoose from "mongoose"
import mongoosePaginate from "mongoose-paginate"

import { SubCategoryDocument } from "../interfaces/sub-category.interface"

/**
 * SubCategorySchema for the database
 */
const subCategorySchema = new mongoose.Schema(
    {
        name: { type: String, unique: true, length: 50, required: true },
        parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
        microCategories: {
            type: Array,
            required: false
        }
    },
    {
        timestamps: true
    }
)

subCategorySchema.set('toJSON', {
    transform: function (_doc, ret, _options) {
        delete ret.loginSecure
        return ret
    }
})

subCategorySchema.plugin(mongoosePaginate)

export default mongoose.model<SubCategoryDocument>("SubCategory", subCategorySchema)
