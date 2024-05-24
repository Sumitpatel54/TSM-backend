// import { DocumentDefinition } from "mongoose"

// import { UserFinancialDocument } from "../interfaces/userFinancial.interface"
import { addJobSendMailQuestionLinkCreation } from "../configurations/bullMq"
import User from "../models/user.model"
import UserFinancial from "../models/userFinancial.model"

/**
 * Used to create a financial record in DB
 *
 * @param payload
 * @returns Object | null
 */
const createFinancialRecord = async (payload: any) => {
    try {
        const userFinancialCreateResponse = await UserFinancial.create(payload)
        if (userFinancialCreateResponse) {
            // mark user document as paid
            addJobSendMailQuestionLinkCreation({ userId: payload.userId, email: payload?.email, userName: `${payload?.firstName}  ${payload?.lastName}` }, payload.userId)
            await User.findByIdAndUpdate(payload.userId, { isPaid: true, exerciseStartDate: new Date() }, { new: true })
            return userFinancialCreateResponse
        }
        throw new Error(`Sorry some errors occurred while creating Exercise`)
    } catch (error: any) {
        throw new Error(error)
    }
}

/**
 * @summary - Get the most recent active subscriptiom
 * @param payload
 */
const retreiveActiveSubscription = async (payload: any) => {
    try {
        const result: any = await UserFinancial.find(payload).sort({ createdAt: -1 }).limit(1)
        if (result) {
            return result
        }
    } catch (error: any) {
        throw new Error(error)
    }
}

/**
 * Used to update a user financial record
 *
 * @param id
 * @param payload
 * @returns QuestionnaireDocument | null
 */
const updateUserFinancialRecord = async (id: string, payload: any) => {
    try {
        const userFinancial: any = await UserFinancial.findByIdAndUpdate(id, payload, { new: true })
        if (userFinancial) {
            return userFinancial
        }
        throw new Error(`user financial record details not found`)
    } catch (error: any) {
        throw new Error(error)
    }
}

export default { createFinancialRecord, retreiveActiveSubscription, updateUserFinancialRecord }
