import mongoose from "mongoose"
import mongoosePaginate from "mongoose-paginate"

import { UserFinancialDocument } from "../interfaces/userFinancial.interface"

/**
 * UserFinancialSchema for the database
 */
const userFinancialSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true
        },
        paymentType: {
            type: String,
            required: true,
            enum: ["recurring", "one-time"]
        },
        stripeCustomer: {
            type: String
        },
        amount: {
            type: Number
        },
        stripeReference: {
            type: String
        },
        currency: {
            type: String
        },
        payment_method: {
            type: String
        },
        payment_method_details: {
            type: Object
        },
        receipt_url: {
            type: String
        },
        status: {
            type: String
        },
        source: {
            type: String
        },
        planId: {
            type: String
        },
        subscriptionId: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

userFinancialSchema.plugin(mongoosePaginate)

export default mongoose.model<UserFinancialDocument>("UserFinancial", userFinancialSchema)
