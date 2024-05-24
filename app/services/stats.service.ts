import { FilterQuery } from "mongoose"

import { UserDocument } from "../interfaces/user.interface"
import { UserFinancialDocument } from "../interfaces/userFinancial.interface"
import User from "../models/user.model"
import UserFinancial from "../models/userFinancial.model"


/**
 * Used to find the total users
 * @param query
 * @returns UserDocument | null
 */
const retrieveTotalUserCount = async (query: FilterQuery<UserDocument>): Promise<UserDocument | undefined> => {
    try {
        const result: any = await User.countDocuments(query).exec()
        if (result) {
            return result
        }
        throw new Error(`Sorry some errors occurred while retriving user count`)
    } catch (error: any) {
        throw new Error(error.message)
    }
}

/**
 * Used to get a number of paid users
 * @param query
 * @returns UserFinancialDocument | null
 */
 const retrievePaidUserCount = async (query: any): Promise<UserFinancialDocument | undefined> => {
    try {
        const result: any = await UserFinancial.find().distinct(query).exec()
        if (result) {
            return result
        }
        throw new Error(`Sorry some errors occurred while retriving paid user count`)
    } catch (error: any) {
        throw new Error(error.message)
    }
}


export default { retrieveTotalUserCount, retrievePaidUserCount }
