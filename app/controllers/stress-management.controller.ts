import HttpStatusCode from "http-status-codes"
import mongoose from "mongoose"
// import { v4 } from "uuid"

import { Request, Response } from "../interfaces/express.interface"
import StressManagementService from "../services/stress-management.service"
import CommonFunctions from "../utilities/common"

const apiListStressManagement = async (req: Request, res: Response) => {
  const statusCode = 500

  try {
    const result = await StressManagementService.listStressManagement({})

    return res.status(200).send({
      status: true,
      data: result
    })
  }
  catch (error: any) {
    return res.status(statusCode).send({
      status: false,
      message: error.message
    })
  }
}

const apiRetrieveStressManagement = async (req: Request, res: Response) => {
  try {
    const id: any = req.params.id?.toString()
    const response = await StressManagementService.retrieveStressManagement({ _id: new mongoose.Types.ObjectId(id) })
    if (response !== null) {
      return res.status(200).send({
        status: true,
        data: response,
        message: "Stress management Record Fetched"
      })
    }
    return res.status(500).send({
      status: false,
      message: "No record found"
    })

  } catch (error: any) {
    return res.status(500).send({
      status: false,
      message: error.message
    })
  }
}

const apiCreateStressManagement = async (req: Request, res: Response) => {
  try {
    const payload: any = req.body ? req.body : undefined
    if (payload === undefined || !payload.categoryName) {
      return res.status(HttpStatusCode.BAD_REQUEST).send({
        status: false,
        message: "Invalid Payload"
      })
    }
    const createResponse = await StressManagementService.createStressManagement(payload)
    return res.status(200).send({
      status: true,
      data: createResponse,
      message: "Stress management Record Created"
    })
  } catch (error: any) {
    return res.status(500).send({
      status: false,
      message: error.message
    })
  }
}

/**
 * @summary - API adds stress management detail
 * @param req
 * @param res
 * @returns
 */
const apiAddStressManagementDetail = async (req: Request, res: Response) => {
  let statusCode = 500
  const id: any = req.params.id
  const file: any = req.files?.video
  const image: any = req.files?.image
  const description: any = req.body.description
  const title: any = req.body.title

  try {
    CommonFunctions.validateRequestForEmptyValues({ description })

    // get stress management
    let retrieveStressManagementResponse: any = await StressManagementService.retrieveStressManagement({ _id: new mongoose.Types.ObjectId(id) })

    if (!retrieveStressManagementResponse) {
      statusCode = 400
      throw new Error(`Stress management does not exist with id: ${id}`)
    }
    retrieveStressManagementResponse = retrieveStressManagementResponse.toObject()

    const stressManagement: any = { categoryName: retrieveStressManagementResponse.categoryName, title: retrieveStressManagementResponse.title, categoryId: id }

    if (file) stressManagement["video"] = await CommonFunctions.getUploadURL(file)
    if (image) stressManagement["image"] = await CommonFunctions.getUploadURL(image)
    if (description) stressManagement["description"] = description
    if (title) stressManagement["title"] = title

    const createResponse = await StressManagementService.createStressManagementDetail(stressManagement)

    return res.status(200).send({
      status: true,
      data: createResponse,
      message: "Stress management detail Record Created"
    })
  } catch (error: any) {
    return res.status(statusCode).send({
      status: false,
      message: error.message
    })
  }
}

/**
 * @summary - Get a single stress managemennt detail
 * @param req
 * @param res
 * @returns
 */
const apiSingleRetrieveStressManagementDetail = async (req: Request, res: Response) => {
  try {
    const detailId: any = req.params.detailId?.toString()
    const retrieveStressManagementDetailResponse: any = await StressManagementService.retrieveStressManagementDetail({ _id: new mongoose.Types.ObjectId(detailId) })

    return res.status(200).send({
      status: true,
      data: retrieveStressManagementDetailResponse,
      message: "Stress management detail Record"
    })

  } catch (error: any) {
    return res.status(500).send({
      status: false,
      message: error.message
    })
  }
}

/**
 * @summary - Search stress management detail
 * @param req
 * @param res
 * @returns
 */
const searchStressManagementDetail = async (req: Request, res: Response) => {
  let statusCode = 500

  try {
    const pageNo: any = Number(req.query.pageNo) || 1
    const perPage: any = Number(req.query.perPage) || 10
    const categoryId: any = req.query.categoryId
    const searchString: any = req.query.searchString
    const sortField: any = req.query.sortField
    let sortOrder: any = req.query.sortOrder || "asc"

    // manage sort order
    if (sortOrder === "asc") sortOrder = 1
    else sortOrder = -1

    const payload: any = {}
    const project: any = {}
    const match: any = {}
    const sort: any = {}
    const arr: any = []
    const options = { page: pageNo, limit: perPage }

    // manage searh filters
    const obj: any = {}
    if (categoryId) obj.categoryId = categoryId

    if (searchString) {
      payload["$match"] = { $text: { $search: `${searchString}`.trim() } }
    }
    else {
      payload["$match"] = obj
    }

    // determine what fields to generate
    project["$project"] = { categoryName: 1, description: 1, video: 1, title: 1, image: 1 }

    // manage sorting
    if (sortField) sort["$sort"] = { [sortField]: sortOrder }

    arr.push(payload)
    arr.push(project)
    if (Object.keys(match).length > 0) arr.push(match)
    if (Object.keys(sort).length > 0) arr.push(sort)

    if (categoryId) payload.categoryId = categoryId

    const searchResponse: any = await StressManagementService.retrieveStressManagementWithPaginateAggregate(arr, options)
    return res.status(200).send({
      status: true,
      data: searchResponse.docs,
      totalPages: searchResponse.totalPages,
      totalQuestions: searchResponse.totalDocs,
      message: "Stress management Records retrieved"
    })
  } catch (error: any) {
    return res.status(statusCode).send({
      status: false,
      message: error.message
    })
  }
}

/**
 * @summary - API update stress management detail
 * @param req
 * @param res
 * @returns
 */
const apiUpdateStressManagementDetail = async (req: Request, res: Response) => {
  let statusCode = 500
  const id: any = req.params.id
  const detailId: any = req.params.detailId
  const file: any = req.files?.video || req.body.video
  const image: any = req.files?.image || req.body.image
  const description: any = req.body.description
  const categoryName = req.body.categoryName
  const title = req.body.title
  const detailObject: any = {}
  const stressObject: any = { $set: {} }
  console.log("file", file)

  try {
    // update the category name
    if (categoryName) {
      stressObject["$set"]["categoryName"] = categoryName
      await StressManagementService.findAndUpdateManyStressManagementDetail(id, stressObject)

      try {
        await StressManagementService.updateStressManagement(id, stressObject)
      }
      catch (e) {
        console.log(e)
      }
    }

    if (file && file !== "null" && !CommonFunctions.stringIsAValidUrl(file)) detailObject["video"] = await CommonFunctions.getUploadURL(file)
    else if (file === null || file === "null") detailObject["video"] = null

    if (image && image !== "null") detailObject["image"] = await CommonFunctions.getUploadURL(image)
    else if (image === null || image === "null") detailObject["image"] = null

    if (description) detailObject["description"] = description
    if (title) detailObject["title"] = title
    if (categoryName) {
      detailObject["categoryName"] = categoryName
      detailObject["categoryId"] = id
    }

    const updateResponse = await StressManagementService.updateStressManagementDetail(detailId, detailObject)

    return res.status(200).send({
      status: true,
      data: updateResponse,
      message: "Stress management detail Record Updated"
    })
  } catch (error: any) {
    return res.status(statusCode).send({
      status: false,
      message: error.message
    })
  }
}

/**
 * @summary - Remove stress management detail
 * @param req
 * @param res
 * @returns
 */
const apiRemoveStressManagementDetail = async (req: Request, res: Response) => {
  let statusCode = 500
  const detailId: any = req.params.detailId

  try {
    const updateResponse = await StressManagementService.deleteStressManagementDetail(detailId)

    return res.status(200).send({
      status: true,
      data: updateResponse,
      message: "Stress management detail Record deleted"
    })
  } catch (error: any) {
    return res.status(statusCode).send({
      status: false,
      message: error.message
    })
  }
}

const apiUpdateStressManagement = async (req: Request, res: Response) => {
  try {
    const id: any = req.params.id
    const categoryName = req.body.categoryName

    const stressObject: any = { $set: {} }

    if (categoryName) {
      stressObject["$set"]["categoryName"] = categoryName
      await StressManagementService.findAndUpdateManyStressManagementDetail(id, stressObject)
    }

    const updateResponse = await StressManagementService.updateStressManagement(id, stressObject)
    return res.status(200).send({
      status: true,
      data: updateResponse,
      message: "Stress management Record Updated"
    })
  } catch (error: any) {
    return res.status(500).send({
      status: false,
      message: error.message
    })
  }
}

const apiDeleteStressManagement = async (req: Request, res: Response) => {
  try {
    const id: any = req.params.id
    const deleteResponse = await StressManagementService.deleteStressManagement(id)
    return res.status(200).send({
      status: true,
      data: deleteResponse,
      message: "Delete response Record Deleted"
    })
  } catch (error: any) {
    return res.status(500).send({
      status: false,
      message: error.message
    })
  }
}

export default { apiListStressManagement, apiRetrieveStressManagement, apiCreateStressManagement, apiUpdateStressManagement, apiDeleteStressManagement, apiAddStressManagementDetail, apiUpdateStressManagementDetail, apiRemoveStressManagementDetail, apiSingleRetrieveStressManagementDetail, searchStressManagementDetail }
