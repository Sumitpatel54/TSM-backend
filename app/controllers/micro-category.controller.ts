import HttpStatusCode from "http-status-codes"
import mongoose from "mongoose"

import { Request, Response } from "../interfaces/express.interface"
import MicroCategoryService from "../services/micro-category.service"
import commonUtilitie from "../utilities/common"

const apiCreateMicroCategory = async (req: Request, res: Response) => {
    try {
        const payload: any = req.body ? req.body : undefined
        if (payload === undefined) {
            return res.status(HttpStatusCode.BAD_REQUEST).send({
                status: false,
                message: "Invalid Payload"
            })
        }
        const createMicroCategoryResponse = await MicroCategoryService.createMicroCategory(payload)
        return res.status(200).send({
            status: true,
            data: createMicroCategoryResponse,
            message: "MicroCategory Record Created"
        })
    } catch (error: any) {
        return res.status(404).send({
            status: false,
            message: error.message
        })
    }
}


const apiRetrieveMicroCategory = async (req: Request, res: Response) => {
    try {
        const microCategoryId: any = req.params.id?.toString()
        const retrieveMicroCategoryResponse = await MicroCategoryService.retrieveMicroCategory({ _id: new mongoose.Types.ObjectId(microCategoryId) })
        if (retrieveMicroCategoryResponse !== null) {
            return res.status(200).send({
                status: true,
                data: retrieveMicroCategoryResponse,
                message: "MicroCategory Record Fetched"
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

const apiListMicroCategories = async (req: Request, res: Response) => {
    try {
        const pageNo: any = Number(req.query.pageNo)
        const perPage: any = Number(req.query.perPage)
        const queryParams = { pageNo, perPage }
        const listMicroCategoriesResponse: any = await MicroCategoryService.listMicroCategories(queryParams)
        if (listMicroCategoriesResponse !== null) {
            let totalData = (listMicroCategoriesResponse[0].totalCount[0]) ? listMicroCategoriesResponse[0].totalCount[0].count : 1
            let totalPages = commonUtilitie.getTotalPages(totalData, perPage)
            return res.status(200).send({
                status: true,
                data: listMicroCategoriesResponse[0].paginatedResults,
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



const apiUpdateMicroCategory = async (req: Request, res: Response) => {
    try {
        const payload: any = req.body
        const microCategoryId: any = req.params.id

        const updateMicroCategoryResponse = await MicroCategoryService.updateMicroCategory(microCategoryId, payload)
        return res.status(200).send({
            status: true,
            data: updateMicroCategoryResponse,
            message: "MicroCategory Record Updated"
        })
    } catch (error: any) {
        return res.status(404).send({
            status: false,
            message: error.message
        })
    }
}

const apiDeleteMicroCategory = async (req: Request, res: Response) => {
    try {
        const categoryId: any = req.params.id
        const deleteMicroCategoryResponse = await MicroCategoryService.deleteMicroCategory(categoryId)
        return res.status(200).send({
            status: true,
            data: deleteMicroCategoryResponse,
            message: "MicroCategory Record Deleted"
        })
    } catch (error: any) {
        return res.status(404).send({
            status: false,
            message: error.message
        })
    }
}



export default {
    apiCreateMicroCategory,
    apiRetrieveMicroCategory,
    apiUpdateMicroCategory,
    apiListMicroCategories,
    apiDeleteMicroCategory
}
