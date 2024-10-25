import mongoose, { Document, Schema } from 'mongoose'

export interface IOnboardingProgress extends Document {
    userId: mongoose.Types.ObjectId;
    currentQuestionIndex: number;
    completedSections: number;
    progress: number;
}

const OnboardingProgressSchema: Schema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    currentQuestionIndex: {
        type: Number,
        default: 0
    },
    completedSections: {
        type: Number,
        default: 0
    },
    progress: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

export default mongoose.model<IOnboardingProgress>('OnboardingProgress', OnboardingProgressSchema)
