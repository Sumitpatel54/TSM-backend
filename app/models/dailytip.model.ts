import mongoose, { Document, Schema } from 'mongoose'

export interface IDailyTip extends Document {
    title: string;
    description: string;
    imageUrl?: string[];
    day: string;
    createdAt: Date;
    updatedAt: Date;
}

const dailyTipSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    imageUrl: [{
        type: String,
        required: false,
    }],
    day: {
        type: String,
        required: true,
        default: null
    }
}, {
    timestamps: true
})

export default mongoose.model<IDailyTip>('DailyTip', dailyTipSchema)

