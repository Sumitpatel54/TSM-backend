import mongoose from "mongoose"

export interface QuestionnaireDocument extends mongoose.Document {
    id?: string
    sectionName: string
    questionType: string
    title: string
    description: string
    options: Array<object>
    imageRequired: Array<object>
    queryBlock: Array<object>
    questionnaire: Array<object>
    imageUrl: Array<string>
    previousQuestion: string
    createdAt: Date
    updatedAt: Date
    selectedExercise: string
    questionNumber: number
}

