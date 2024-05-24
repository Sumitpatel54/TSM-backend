import { FilterQuery, UpdateQuery } from "mongoose"

import { UserDocument } from "../interfaces/user.interface"
import Token from "../models/token.model"
import User from "../models/user.model"


/**
 * Used to create user record in DB
 *
 * @param payload
 * @returns Object | null
 */
const createUser = async (payload: any) => {
    try {
        const user = await User.create(payload)
        if (user) {
            return user
        }
        throw new Error(`Sorry some errors occurred while creating user`)
    } catch (error: any) {
        throw new Error(error)
    }
}

/**
 * Used to update user details by userId
 *
 * @param userId
 * @param payload
 * @returns UserDocument | null
 */
const updateUser = async (userId: string, payload: UpdateQuery<UserDocument>): Promise<UserDocument | null> => {
    try {
        const user: any = await User.findByIdAndUpdate(userId, payload, { new: true })
        if (user) {
            return user
        }
        throw new Error(`User details not found`)
    } catch (error: any) {
        throw new Error(error)
    }
}

/**
 * Used to delete user record from DB
 * @param userId
 * @returns
 */
const deleteUser = async (userId: string) => {
    try {
        const user = await User.findByIdAndDelete(userId)
        return user
    } catch (error: any) {
        throw new Error(error)
    }
}

/**
 * Used to find user by providing filter query
 * @param query
 * @returns UserDocument | null
 */
const findUser = async (query: FilterQuery<UserDocument>): Promise<UserDocument | undefined> => {
    try {
        const user: any = await User.findOne(query).exec()
        return user
    } catch (error: any) {
        throw new Error(error.message)
    }
}

/**
 * Used to find token by providing filter query
 * @param query
 * @returns any | null
 */
const findToken = async (query: any): Promise<any | undefined> => {
    try {
        const user: any = await Token.findOne(query).exec()
        return user
    } catch (error: any) {
        throw new Error(error.message)
    }
}


const findUserWithQuestionnaireAnswers = async (query: any, questionnaireAnswersId: any) => {
    try {
        let queAnsId = `questionnaireAnswers.${questionnaireAnswersId}`
        const user: any = await User.findOne(query, { [queAnsId]: 1 }).exec()
        return user
    } catch (error: any) {
        throw new Error(error.message)
    }
}

export default { createUser, updateUser, deleteUser, findUser, findToken, findUserWithQuestionnaireAnswers }
