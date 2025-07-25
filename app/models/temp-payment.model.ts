import mongoose, { Document, Schema } from 'mongoose'

export interface TempPaymentDocument extends Document {
    paymentIntentId: string
    checkoutSessionId: string
    paymentStatus: string
    paymentType: string
    amount: number
    currency: string
    metadata: any
    email?: string
    createdAt: Date
    expiresAt: Date
}

const TempPaymentSchema = new Schema<TempPaymentDocument>(
    {
        paymentIntentId: {
            type: String,
            required: false,
        },
        checkoutSessionId: {
            type: String,
            required: true,
            unique: true,
        },
        paymentStatus: {
            type: String,
            required: true,
            enum: ['pending', 'succeeded', 'failed', 'canceled', 'registered'],
            default: 'pending',
        },
        paymentType: {
            type: String,
            required: true,
            enum: ['ONE_TIME_PURCHASE', 'SUBSCRIPTION'],
        },
        amount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            required: true,
        },
        metadata: {
            type: Schema.Types.Mixed,
            required: false,
        },
        email: {
            type: String,
            required: false,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        expiresAt: {
            type: Date,
            default: function () {
                // Set expiration to 24 hours from now
                const date = new Date()
                date.setHours(date.getHours() + 24)
                return date
            },
        },
    },
    {
        timestamps: true,
    }
)

// Create TTL index for automatic document expiration
TempPaymentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const TempPayment = mongoose.model<TempPaymentDocument>('TempPayment', TempPaymentSchema)

export default TempPayment 