import { Document, FilterQuery, UpdateQuery } from "mongoose"

import { CategoryDocument } from "../interfaces/category.interface"
import Category from "../models/category.model"


/**
 * Used to create Category record in DB
 *
 * @param payload
 * @returns Object | null
 */
const createCategory = async (payload: Document<CategoryDocument>) => {
    try {
        const category = await Category.create(payload)
        if (category) {
            return category
        }
        throw new Error(`Sorry some errors occurred while creating Category`)
    } catch (error: any) {
        throw new Error(error)
    }
}



/**
 * Used to find category by providing filter query
 * @param query
 * @returns CategoryDocument | null
 */
const retrieveCategory = async (query: FilterQuery<CategoryDocument>): Promise<CategoryDocument | undefined> => {
    try {
        const category: any = await Category.findOne(query).exec()
        if (category) {
            return category
        }
        throw new Error(`Sorry some errors occurred while retriving Category`)
    } catch (error: any) {
        throw new Error(error.message)
    }
}

/**
 * Used to find user by providing filter query
 * @param query
 * @returns CategoryDocument | null
 */
const listCategories = async (query: FilterQuery<CategoryDocument>): Promise<CategoryDocument | undefined> => {
    try {

        let queryObj: any = []

        let project: any = { "$project": { "__v": 0 } }
        queryObj.push(project)

        let subCategoriesJoin = {
            $lookup:
            {
                from: "subcategories",
                localField: "_id",
                foreignField: "parentId",
                as: "subCategories",
                pipeline: [
                    { "$project": { "parentId": 0, "__v": 0 } }
                ]
            }
        }
        queryObj.push(subCategoriesJoin)

        let categoriesFacet = {
            $facet: {
                paginatedResults: [{ $skip: query.perPage * (query.pageNo - 1) }, { $limit: Number(query.perPage) }],
                totalCount: [{ $count: 'count' }]
            }
        }
        queryObj.push(categoriesFacet)

        const listCategoriesByPaginationResponse: any = await Category.aggregate(queryObj).exec()

        if (listCategoriesByPaginationResponse) {
            return listCategoriesByPaginationResponse
        }
        throw new Error(`listCategories details not found`)
    } catch (error: any) {
        throw new Error(error.message)
    }
}


/**
 * Used to update category details by userId
 *
 * @param categoryId
 * @param payload
 * @returns CategoryDocument | null
 */
const updateCategory = async (categoryId: string, payload: UpdateQuery<CategoryDocument>): Promise<CategoryDocument | null> => {
    try {
        const category: any = await Category.findByIdAndUpdate(categoryId, payload, { new: true })
        if (category) {
            return category
        }
        throw new Error(`Category details not found`)
    } catch (error: any) {
        throw new Error(error)
    }
}

/**
 * Used to delete category record from DB
 * @param categoryId
 * @returns
 */
const deleteCategory = async (categoryId: string) => {
    try {
        const user = await Category.findByIdAndDelete(categoryId)
        return user
    } catch (error: any) {
        throw new Error(error)
    }
}


export default { createCategory, retrieveCategory, listCategories, updateCategory, deleteCategory }
