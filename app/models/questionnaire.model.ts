import mongoose from "mongoose"
import mongoosePaginate from "mongoose-paginate"
import aggregatePaginate from "mongoose-aggregate-paginate-v2"
import autoIncrement from 'mongoose-sequence'

import { QuestionnaireDocument } from "../interfaces/questionnaire.interface"

// @ts-ignore
const AutoIncrement = autoIncrement(mongoose)

/**
 * QuestionnaireSchema for the database
 */
const questionnaireSchema = new mongoose.Schema(
    {
        sectionName: {
            type: String,
            required: true
        },
        questionNumber: {
            type: Number,
            default: 0
        },
        questionType: {
            type: String,
            required: false
        },
        title: {
            type: String,
            required: true
        },
        options: {
            type: Array,
            required: false
        },
        imageRequired: {
            type: Boolean,
            required: false,
            default: false
        },
        queryBlock: {
            type: Array,
            required: false
        },
        imageUrl: {
            type: [String],
            required: false
        },
        previousQuestion: {
            type: String,
            default: null,
            required: false
        },
        selectedExercise: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

// @ts-ignore
questionnaireSchema.plugin(AutoIncrement, {inc_field: 'questionNumber'})

// questionnaireSchema.pre('save', function (next: any) {
//     let self = this
//     if (self.questionNumber === undefined) {
//         Questionnaire.findOne({})
//             .sort({ questionNumber: -1 })
//             .exec(function (err: any, data: any) {
//                 if (!data.questionNumber) {
//                     self.questionNumber = 1
//                     next()
//                 } else {
//                     self.questionNumber = data.questionNumber + 1
//                     next()
//                 }
//             })
//         next()
//     }
// })

questionnaireSchema.index({
    sectionName: "text",
    title: "text"
})

questionnaireSchema.plugin(mongoosePaginate)

questionnaireSchema.plugin(aggregatePaginate)

export default mongoose.model<QuestionnaireDocument>("Questionnaire", questionnaireSchema)
