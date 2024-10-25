import mongoose, { Schema, Document } from 'mongoose'

export interface IDailyData extends Document {
    userId: mongoose.Types.ObjectId;
    date: string;
    exercises: any;
    nutrition: any;
}

const DailyDataSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    exercises: { type: Schema.Types.Mixed },
    nutrition: { type: Schema.Types.Mixed }
})

export default mongoose.model<IDailyData>('DailyData', DailyDataSchema)
