import HttpStatusCode from "http-status-codes"
import mongoose from "mongoose"

import { Request, Response } from "../interfaces/express.interface"
import SubCategoryService from "../services/sub-category.service"
import commonUtilitie from "../utilities/common"

const apiCreateSubCategory = async (req: Request, res: Response) => {
    try {
        const payload: any = req.body ? req.body : undefined
        if (payload === undefined) {
            return res.status(HttpStatusCode.BAD_REQUEST).send({
                status: false,
                message: "Invalid Payload"
            })
        }
        const createSubCategoryResponse = await SubCategoryService.createSubCategory(payload)
        return res.status(200).send({
            status: true,
            data: createSubCategoryResponse,
            message: "SubCategory Record Created"
        })
    } catch (error: any) {
        return res.status(404).send({
            status: false,
            message: error.message
        })
    }
}


const apiRetrieveSubCategory = async (req: Request, res: Response) => {
    try {
        const subCategoryId: any = req.params.id?.toString()
        const retrieveSubCategoryResponse = await SubCategoryService.retrieveSubCategory({ _id: new mongoose.Types.ObjectId(subCategoryId) })
        if (retrieveSubCategoryResponse !== null) {
            return res.status(200).send({
                status: true,
                data: retrieveSubCategoryResponse,
                message: "SubCategory Record Fetched"
            })
        }
        return res.status(404).send({
            status: false,
            message: "No record found"
        })

    } catch (error: any) {
        return res.status(404).send({
            status: false,
            message: error.message
        })
    }
}

const apiListSubCategories = async (req: Request, res: Response) => {
    try {
        const pageNo: any = Number(req.query.pageNo)
        const perPage: any = Number(req.query.perPage)
        const queryParams = { pageNo, perPage }
        const listSubCategoriesResponse: any = await SubCategoryService.listSubCategories(queryParams)
        if (listSubCategoriesResponse !== null) {
            let totalData = (listSubCategoriesResponse[0].totalCount[0]) ? listSubCategoriesResponse[0].totalCount[0].count : 1
            let totalPages = commonUtilitie.getTotalPages(totalData, perPage)
            return res.status(200).send({
                status: true,
                data: listSubCategoriesResponse[0].paginatedResults,
                totalPages: totalPages
            })
        }
        return res.status(404).send({
            status: false,
            message: "No record found"
        })

    } catch (error: any) {
        return res.status(404).send({
            status: false,
            message: error.message
        })
    }
}



const apiUpdateSubCategory = async (req: Request, res: Response) => {
    try {
        const payload: any = req.body
        const subCategoryId: any = req.params.id

        const updateSubCategoryResponse = await SubCategoryService.updateSubCategory(subCategoryId, payload)
        return res.status(200).send({
            status: true,
            data: updateSubCategoryResponse,
            message: "SubCategory Record Updated"
        })
    } catch (error: any) {
        return res.status(404).send({
            status: false,
            message: error.message
        })
    }
}

const apiDeleteSubCategory = async (req: Request, res: Response) => {
    try {
        const categoryId: any = req.params.id
        const deleteSubCategoryResponse = await SubCategoryService.deleteSubCategory(categoryId)
        return res.status(200).send({
            status: true,
            data: deleteSubCategoryResponse,
            message: "SubCategory Record Deleted"
        })
    } catch (error: any) {
        return res.status(404).send({
            status: false,
            message: error.message
        })
    }
}



export default {
    apiCreateSubCategory,
    apiRetrieveSubCategory,
    apiUpdateSubCategory,
    apiListSubCategories,
    apiDeleteSubCategory
}
