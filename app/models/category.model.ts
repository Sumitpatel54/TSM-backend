import mongoose from "mongoose"
import mongoosePaginate from "mongoose-paginate"

import { CategoryDocument } from "../interfaces/category.interface"

/**
 * CategorySchema for the database
 */
const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            unique: true,
            length: 50,
            required: true
        },
        subCategories: {
            type: Array,
            required: false
        }
    },
    {
        timestamps: true
    }
)

categorySchema.set('toJSON', {
    transform: function (_doc, ret, _options) {
        delete ret.loginSecure
        return ret
    }
})

categorySchema.plugin(mongoosePaginate)

export default mongoose.model<CategoryDocument>("Category", categorySchema)
