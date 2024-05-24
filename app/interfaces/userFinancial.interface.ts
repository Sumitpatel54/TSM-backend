import mongoose from "mongoose"

export interface UserFinancialDocument extends mongoose.Document {
    userId: string
    amount: number
    stripeReference: string
    currency: string
    payment_method: string
    payment_method_details: object
    receipt_url: string
    status: string
    source: string
    paymentType: string
    stripeCustomer: string
    planId: string
    subscriptionId: string
}

