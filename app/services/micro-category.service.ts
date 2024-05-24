import { DocumentDefinition, FilterQuery, UpdateQuery } from "mongoose"

import { MicroCategoryDocument } from "../interfaces/micro-category.interface"
import MicroCategory from "../models/micro-category.model"


/**
 * Used to create MicroCategory record in DB
 *
 * @param payload
 * @returns Object | null
 */
const createMicroCategory = async (payload: DocumentDefinition<MicroCategoryDocument>) => {
    try {
        const microcategory = await MicroCategory.create(payload)
        if (microcategory) {
            return microcategory
        }
        throw new Error(`Sorry some errors occurred while creating MicroCategory`)
    } catch (error: any) {
        throw new Error(error)
    }
}



/**
 * Used to find microcategory by providing filter query
 * @param query
 * @returns MicroCategoryDocument | null
 */
const retrieveMicroCategory = async (query: FilterQuery<MicroCategoryDocument>): Promise<MicroCategoryDocument | undefined> => {
    try {
        const microcategory: any = await MicroCategory.findOne(query).exec()
        if (microcategory) {
            return microcategory
        }
        throw new Error(`Sorry some errors occurred while retriving MicroCategory`)
    } catch (error: any) {
        throw new Error(error.message)
    }
}

/**
 * Used to find user by providing filter query
 * @param query
 * @returns MicroCategoryDocument | null
 */
const listMicroCategories = async (query: FilterQuery<MicroCategoryDocument>): Promise<MicroCategoryDocument | undefined> => {
    try {
        let categoriesFacet = {
            $facet: {
                paginatedResults: [{ $skip: query.perPage * (query.pageNo - 1) }, { $limit: Number(query.perPage) }],
                totalCount: [{ $count: 'count' }]
            }
        }
        const listCategoriesByPaginationResponse: any = await MicroCategory.aggregate([categoriesFacet])

        if (listCategoriesByPaginationResponse) {
            return listCategoriesByPaginationResponse
        }
        throw new Error(`listCategories details not found`)
    } catch (error: any) {
        throw new Error(error.message)
    }
}


/**
 * Used to update microcategory details by userId
 *
 * @param categoryId
 * @param payload
 * @returns MicroCategoryDocument | null
 */
const updateMicroCategory = async (categoryId: string, payload: UpdateQuery<MicroCategoryDocument>): Promise<MicroCategoryDocument | null> => {
    try {
        const microcategory: any = await MicroCategory.findByIdAndUpdate(categoryId, payload, { new: true })
        if (microcategory) {
            return microcategory
        }
        throw new Error(`MicroCategory details not found`)
    } catch (error: any) {
        throw new Error(error)
    }
}

/**
 * Used to delete microcategory record from DB
 * @param categoryId
 * @returns
 */
const deleteMicroCategory = async (categoryId: string) => {
    try {
        const user = await MicroCategory.findByIdAndDelete(categoryId)
        return user
    } catch (error: any) {
        throw new Error(error)
    }
}


export default { createMicroCategory, retrieveMicroCategory, listMicroCategories, updateMicroCategory, deleteMicroCategory }
