import mongoose from "mongoose"

import { SupportedOriginDocument } from "../interfaces/supportedOrigin"

const supportedOriginSchema = new mongoose.Schema({
    url: {
        type: String
    },
},{
    timestamps: true
})

supportedOriginSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        // remove these props when object is serialized
        delete ret._id
    }
})

export default mongoose.model<SupportedOriginDocument>("SupportedOrigin", supportedOriginSchema)
