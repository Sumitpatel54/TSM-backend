import { DocumentDefinition, FilterQuery, UpdateQuery } from "mongoose"

import { SubCategoryDocument } from "../interfaces/sub-category.interface"
import SubCategory from "../models/sub-category.model"


/**
 * Used to create SubCategory record in DB
 *
 * @param payload
 * @returns Object | null
 */
const createSubCategory = async (payload: DocumentDefinition<SubCategoryDocument>) => {
    try {
        const subcategory = await SubCategory.create(payload)
        if (subcategory) {
            return subcategory
        }
        throw new Error(`Sorry some errors occurred while creating SubCategory`)
    } catch (error: any) {
        throw new Error(error)
    }
}



/**
 * Used to find subcategory by providing filter query
 * @param query
 * @returns SubCategoryDocument | null
 */
const retrieveSubCategory = async (query: FilterQuery<SubCategoryDocument>): Promise<SubCategoryDocument | undefined> => {
    try {
        const subcategory: any = await SubCategory.findOne(query).exec()
        if (subcategory) {
            return subcategory
        }
        throw new Error(`Sorry some errors occurred while retriving SubCategory`)
    } catch (error: any) {
        throw new Error(error.message)
    }
}

/**
 * Used to find user by providing filter query
 * @param query
 * @returns SubCategoryDocument | null
 */
const listSubCategories = async (query: FilterQuery<SubCategoryDocument>): Promise<SubCategoryDocument | undefined> => {
    try {
        let queryObj: any = []

        let project: any = { "$project": { "__v": 0, "parentId" : 0 } }
        queryObj.push(project)

        let microCategoriesJoin = {
            $lookup:
            {
                from: "microcategories",
                localField: "_id",
                foreignField: "parentId",
                as: "microCategories",
                pipeline: [
                    { "$project": { "parentId": 0, "__v": 0 } }
                ]
            }
        }
        queryObj.push(microCategoriesJoin)

        let categoriesFacet = {
            $facet: {
                paginatedResults: [{ $skip: query.perPage * (query.pageNo - 1) }, { $limit: Number(query.perPage) }],
                totalCount: [{ $count: 'count' }]
            }
        }
        queryObj.push(categoriesFacet)

        const listSubCategoriesByPaginationResponse: any = await SubCategory.aggregate(queryObj).exec()

        if (listSubCategoriesByPaginationResponse) {
            return listSubCategoriesByPaginationResponse
        }
        throw new Error(`listCategories details not found`)
    } catch (error: any) {
        throw new Error(error.message)
    }
}


/**
 * Used to update subcategory details by userId
 *
 * @param categoryId
 * @param payload
 * @returns SubCategoryDocument | null
 */
const updateSubCategory = async (categoryId: string, payload: UpdateQuery<SubCategoryDocument>): Promise<SubCategoryDocument | null> => {
    try {
        const subcategory: any = await SubCategory.findByIdAndUpdate(categoryId, payload, { new: true })
        if (subcategory) {
            return subcategory
        }
        throw new Error(`SubCategory details not found`)
    } catch (error: any) {
        throw new Error(error)
    }
}

/**
 * Used to delete subcategory record from DB
 * @param categoryId
 * @returns
 */
const deleteSubCategory = async (categoryId: string) => {
    try {
        const user = await SubCategory.findByIdAndDelete(categoryId)
        return user
    } catch (error: any) {
        throw new Error(error)
    }
}


export default { createSubCategory, retrieveSubCategory, listSubCategories, updateSubCategory, deleteSubCategory }
