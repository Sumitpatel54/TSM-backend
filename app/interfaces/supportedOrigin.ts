import mongoose from "mongoose"

export interface SupportedOriginDocument extends mongoose.Document {
    url: string;
    createdAt: Date;
    updatedAt: Date;
}

