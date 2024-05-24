import HttpStatusCode from "http-status-codes"
import mongoose from "mongoose"

import { Request, Response } from "../interfaces/express.interface"
import CategoryService from "../services/category.service"
import commonUtilitie from "../utilities/common"

const apiCreateCategory = async (req: Request, res: Response) => {
    try {
        const payload: any = req.body ? req.body : undefined
        if (payload === undefined) {
            return res.status(HttpStatusCode.BAD_REQUEST).send({
                status: false,
                message: "Invalid Payload"
            })
        }
        const createCategoryResponse = await CategoryService.createCategory(payload)
        return res.status(200).send({
            status: true,
            data: createCategoryResponse,
            message: "Category Record Created"
        })
    } catch (error: any) {
        return res.status(404).send({
            status: false,
            message: error.message
        })
    }
}


const apiRetrieveCategory = async (req: Request, res: Response) => {
    try {
        const categoryId: any = req.params.id?.toString()
        const retrieveCategoryResponse = await CategoryService.retrieveCategory({ _id: new mongoose.Types.ObjectId(categoryId) })
        if (retrieveCategoryResponse !== null) {
            return res.status(200).send({
                status: true,
                data: retrieveCategoryResponse,
                message: "Category Record Fetched"
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

const apiListCategories = async (req: Request, res: Response) => {
    try {
        const pageNo: any = Number(req.query.pageNo)
        const perPage: any = Number(req.query.perPage)
        const queryParams = { pageNo, perPage }
        const listCategoriesResponse: any = await CategoryService.listCategories(queryParams)
        if (listCategoriesResponse !== null) {
            let totalData = (listCategoriesResponse[0].totalCount[0]) ? listCategoriesResponse[0].totalCount[0].count : 1
            let totalPages = commonUtilitie.getTotalPages(totalData, perPage)
            return res.status(200).send({
                status: true,
                data: listCategoriesResponse[0].paginatedResults,
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



const apiUpdateCategory = async (req: Request, res: Response) => {
    try {
        const payload: any = req.body
        const categoryId: any = req.params.id

        const updateCategoryResponse = await CategoryService.updateCategory(categoryId, payload)
        return res.status(200).send({
            status: true,
            data: updateCategoryResponse,
            message: "Category Record Updated"
        })
    } catch (error: any) {
        return res.status(404).send({
            status: false,
            message: error.message
        })
    }
}

const apiDeleteCategory = async (req: Request, res: Response) => {
    try {
        const categoryId: any = req.params.id
        const deleteCategoryResponse = await CategoryService.deleteCategory(categoryId)
        return res.status(200).send({
            status: true,
            data: deleteCategoryResponse,
            message: "Category Record Deleted"
        })
    } catch (error: any) {
        return res.status(404).send({
            status: false,
            message: error.message
        })
    }
}



export default {
    apiCreateCategory,
    apiRetrieveCategory,
    apiUpdateCategory,
    apiListCategories,
    apiDeleteCategory
}
