import { Document, FilterQuery } from "mongoose"

import { NutritionInformationDocument } from "../interfaces/nutrition-information.interface"
import NutritionInformation from "../models/exercise-information.model"

/**
 * Used to find nutrition informtion by providing filter query
 * @param query
 * @returns NutritionInformationDocument | null
 */
 const listNutritionInformtion = async (query: FilterQuery<NutritionInformationDocument>): Promise<NutritionInformationDocument | undefined> => {
    try {
        const nutritionInformation: any = await NutritionInformation.find(query ? query : {})
        if (nutritionInformation) {
            return nutritionInformation
        }
        throw new Error(`Sorry some errors occurred while retriving nutrition information`)
    } catch (error: any) {
        throw new Error(error.message)
    }
}

/**
 * Used to create Nutition Information record in DB
 *
 * @param payload
 * @returns Object | null
 */
const createNutritionInformation = async (payload: Document<NutritionInformationDocument>) => {
    try {
        const nutritionInformation: any = await NutritionInformation.find({})

        if (!Array.isArray(nutritionInformation) || nutritionInformation.length === 0) {
            const nutritionInformation_ = await NutritionInformation.create(payload)
            if (nutritionInformation_) {
                return nutritionInformation_
            }
            throw new Error(`Sorry some errors occurred while creating Nutrition Information`)
        }
    } catch (error: any) {
        throw new Error(error)
    }
}

/**
 * Used to delete nutrition information record from DB
 * @param id
 * @returns
 */
const deleteNutritionInformation = async (id: string) => {
    try {
        const nutritionInformation = await NutritionInformation.findByIdAndDelete(id)
        return nutritionInformation
    } catch (error: any) {
        throw new Error(error)
    }
}

/**
 * Used to update nutrition information details by userId
 *
 * @param id
 * @param payload
 * @returns NutritionInformationDocument | null
 */
const updateNutritionInformation = async (id: string, payload: any): Promise<NutritionInformationDocument | null> => {
    try {
        const nutritionInformation: any = await NutritionInformation.findByIdAndUpdate(id, payload, { new: true })
        if (nutritionInformation) {
            return nutritionInformation
        }
        throw new Error(`Nutrition information details not found`)
    } catch (error: any) {
        throw new Error(error)
    }
}

export default { listNutritionInformtion, createNutritionInformation, deleteNutritionInformation, updateNutritionInformation }
