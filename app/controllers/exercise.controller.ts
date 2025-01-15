/* eslint-disable no-trailing-spaces */
/* eslint-disable semi */
import { Request, Response } from 'express'
import HttpStatusCode from "http-status-codes"
import mongoose from "mongoose"
// import { v4 } from "uuid"

import ExerciseService from "../services/exercise.service"
import CommonFunctions from "../utilities/common"
import constants from "../utilities/directoryPath"

const apiCreateExercise = async (req: Request, res: Response) => {
  try {
    const payload: any = req.body ? req.body : undefined
    if (payload === undefined || !payload.title) {
      return res.status(HttpStatusCode.BAD_REQUEST).send({
        status: false,
        message: "Invalid Payload"
      })
    }
    const createExerciseResponse = await ExerciseService.createExercise({ title: payload.title, tags: [] })
    return res.status(200).send({
      status: true,
      data: createExerciseResponse,
      message: "Exercise Record Created"
    })
  } catch (error: any) {
    return res.status(500).send({
      status: false,
      message: error.message
    })
  }
}

/**
 * @summary - This adds a tag to the exercise parent (General | Postural)
 * @param req
 * @param res
 * @returns
 */
const apiAddTag = async (req: Request, res: Response) => {
  try {
    const exerciseId: any = req.params.id
    const payload: any = req.body ? req.body : undefined
    if (payload === undefined || !payload.title) {
      return res.status(HttpStatusCode.BAD_REQUEST).send({
        status: false,
        message: "Invalid Payload"
      })
    }

    const tag = {
      title: payload.title,
    }

    const query = { $push: { tags: tag } }

    const updateExerciseResponse = await ExerciseService.updateExercise(exerciseId, query)
    const response = updateExerciseResponse?.toObject()?.tags.find((v: any) => v.title === payload.title)
    return res.status(200).send({
      status: true,
      data: response,
      message: "Exercise Record Updated"
    })
  } catch (error: any) {
    return res.status(500).send({
      status: false,
      message: error.message
    })
  }
}

/**
 * @summary - This updates a tag to the exercise parent (General | Postural)
 * @param req
 * @param res
 * @returns
 */
const apiUpdateTag = async (req: Request, res: Response) => {
  // const exerciseId: any = req.params.id
  const tagId: any = req.params.tagId
  const payload: any = req.body ? req.body : undefined
  if (payload === undefined || !payload.title) {
    return res.status(HttpStatusCode.BAD_REQUEST).send({
      status: false,
      message: "Invalid Payload"
    })
  }

  const updateExerciseResponse = await ExerciseService.updateExerciseTags({ 'tags._id': tagId }, { 'tags.$.title': payload.title })
  return res.status(200).send({
    status: true,
    data: updateExerciseResponse,
    message: "Exercise Record Updated"
  })
}

/**
 * @summary - Add exercise to exercise list
 * @param req
 * @param res
 * @returns
 */
const apiAddNewExercisesToExerciseList = async (req: Request, res: Response) => {
  console.log("apiAddNewExercisesToExerciseList========")
  let statusCode = 500

  try {
    const exerciseId: any = req.body.exerciseCategoryId
    // the datatype of this is now an array
    const tagId: any = req.body.tagId ? JSON.parse(req.body.tagId) : null
    const file: any = req.files?.video || req.body.video
    const title: any = req.body.title
    const description: any = req.body.description
    const day: any = JSON.parse(req.body.day)

    CommonFunctions.validateRequestForEmptyValues({ title, exerciseId, tagId })

    if (day && !Array.isArray(day)) {
      throw new Error("'day' has to be an array")
    }

    // Validate AWS credentials before proceeding
    try {
      CommonFunctions.validateAWSCredentials();
    } catch (awsError: any) {
      return res.status(500).send({
        status: false,
        message: `AWS Configuration Error: ${awsError.message}`,
        data: []
      });
    }

    // File size validation
    if (file && !CommonFunctions.stringIsAValidUrl(file)) {
      const maxSize = parseInt(process.env.MAX_FILE_SIZE || '104857600'); // 100MB default
      if (file.size > maxSize) {
        return res.status(413).send({
          status: false,
          message: `File size too large. Maximum size is ${maxSize / (1024 * 1024)}MB`,
          data: []
        });
      }
    }

    // retrieve exercise
    let retrieveExerciseResponse: any = await ExerciseService.retrieveExercise({ _id: new mongoose.Types.ObjectId(exerciseId) })

    if (retrieveExerciseResponse) {
      retrieveExerciseResponse = retrieveExerciseResponse.toObject()
    }
    else {
      statusCode = 400
      throw new Error(`Exercise with exerciseId: ${exerciseId} does not exist.`)
    }

    // check if tags exist
    if (!Array.isArray(retrieveExerciseResponse.tags) || retrieveExerciseResponse.tags.length === 0) {
      statusCode = 400
      throw new Error(`Exercise with exerciseId: ${exerciseId} does not have any tags.`)
    }

    const article: any = {}
    if (file) {
      if (CommonFunctions.stringIsAValidUrl(file)) {
        // If file is already a valid URL, use it directly
        article.video = file
      } else if (file !== "null") {
        // If file is a new upload, get new URL
        const videoUrls = await CommonFunctions.getUploadURLWithDir(file, constants.EXERCISE_VIDEOS)
        article.video = videoUrls[0]
      }
    } else if (file === null || file === "null") {
      article.video = null
    }
    if (title) {
      article.title = title
    }
    if (description) {
      article.description = description
    }
    if (day) {
      article.day = day
    }

    article.exerciseParentId = exerciseId
    article.exerciseParentName = retrieveExerciseResponse.title
    article.tagId = tagId
    article.tag = retrieveExerciseResponse.tags.filter((v: any) => !!tagId.find((t: any) => JSON.stringify(t) === JSON.stringify(v._id)))
    // article.tag = [ retrieveExerciseResponse.tags.find((v: any) => (JSON.stringify(v._id) === JSON.stringify(tagId)))?.title ]

    const createExerciseResponse = await ExerciseService.createExerciseList(article)
    return res.status(200).send({
      status: true,
      data: createExerciseResponse,
      message: "Exercise Record Created"
    })
  } catch (error: any) {
    return res.status(statusCode).send({
      status: false,
      message: error.message,
      data: []
    })
  }
}


const apiGetPresignedUrl = async (req: Request, res: Response) => {
  try {
    const fileName = req.query.fileName as string;
    const fileType = req.query.fileType as string;

    if (!fileName || !fileType) {
      return res.status(400).send({
        status: false,
        message: "fileName and fileType are required"
      });
    }

    // Validate file type
    if (!fileType.startsWith('video/')) {
      return res.status(400).send({
        status: false,
        message: "Only video files are allowed"
      });
    }

    // Sanitize filename
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');

    const urlData = await CommonFunctions.generatePresignedUrl(
      sanitizedFileName,
      fileType,
      constants.EXERCISE_VIDEOS
    );

    if (!urlData?.uploadUrl || !urlData?.fileUrl) {
      throw new Error('Failed to generate presigned URL');
    }

    return res.status(200).send({
      status: true,
      data: urlData
    });
  } catch (error: any) {
    console.error('Error generating presigned URL:', error);
    return res.status(500).send({
      status: false,
      message: error.message || 'Failed to generate upload URL'
    });
  }
};

/**
 * @summary - Update an exercise in exercise list
 * @param req
 * @param res
 * @returns
 */
const apiUpdateExerciseList = async (req: Request, res: Response) => {
  let statusCode = 500

  try {
    const exerciseListId: any = req.params.id
    const file: any = req.files?.video || req.body.video
    const title: any = req.body.title
    const description: any = req.body.description
    const tagId: any = req.body.tagId ? JSON.parse(req.body.tagId) : null
    const tag: any = req.body.tag ? JSON.parse(req.body.tag) : null
    const day: any = req.body.day ? JSON.parse(req.body.day) : null

    const article: any = {}

    // if (file && file !== "null" && !CommonFunctions.stringIsAValidUrl(file)) {
    //   // @ts-ignore
    //   const videoUrls = await CommonFunctions.getUploadURLWithDir(file, constants.EXERCISE_VIDEO)

    //   article.video = videoUrls[0]
    // }
    // else if (file === null || file === "null") {
    //   article.video = null
    // }

    if (file) {
      if (CommonFunctions.stringIsAValidUrl(file)) {
        // If file is already a valid URL, use it directly
        article.video = file
      } else if (file !== "null") {
        // If file is a new upload, get new URL
        const videoUrls = await CommonFunctions.getUploadURLWithDir(file, constants.EXERCISE_VIDEOS)
        article.video = videoUrls[0]
      }
    } else if (file === null || file === "null") {
      article.video = null
    }
    
    if (title) {
      article.title = title
    }
    if (description) {
      article.description = description
    }
    if (Array.isArray(tag) && tag.length > 0) {
      // for (let i = 0; i < tag.length; i++) {
      //   if (!article["$push"]) article["$push"] = { tag: tag[i] }
      //   else article["$push"]["tag"] = tag[i]
      // }
      article.tag = tag
    }
    if (Array.isArray(tagId) && tagId.length > 0) {
      // for (let i = 0; i < tagId.length; i++) {
      //   if (!article["$push"]) article["$push"] = { tagId: tagId[i] }
      //   else article["$push"]["tagId"] = tagId[i]
      // }
      article.tagId = tagId
    }
    if (day) {
      if (day && !Array.isArray(day)) {
        throw new Error("'day' has to be an array")
      }

      article.day = day
    }

    const updateExerciseResponse = await ExerciseService.updateExerciseList(exerciseListId, article)
    return res.status(200).send({
      status: true,
      data: updateExerciseResponse,
      message: "Exercise List Record Updated"
    })
  } catch (error: any) {
    return res.status(statusCode).send({
      status: false,
      message: error.message
    })
  }
}

/**
 * @summary - Get exercise item from ExerciseList collection
 * @param req
 * @param res
 * @returns
 */
const apiGetSingleExerciseItem = async (req: Request, res: Response) => {
  try {
    const exerciseId: any = req.params.id?.toString()
    const retrieveExerciseResponse = await ExerciseService.retrieveExerciseItem({ _id: new mongoose.Types.ObjectId(exerciseId) })
    if (retrieveExerciseResponse !== null) {
      return res.status(200).send({
        status: true,
        data: retrieveExerciseResponse,
        message: "Exercise item Record Fetched"
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

// const apiGetExerciseList = async (req: Request, res: Response) => {

// }

/**
 * @summary - Deletes and exercise item from the ExerciseList model
 * @param req
 * @param res
 * @returns
 */
const apiDeleteExerciseListItem = async (req: Request, res: Response) => {
  try {
    const exerciseId: any = req.params.id
    const deleteExerciseResponse = await ExerciseService.deleteExerciseItem(exerciseId)
    return res.status(200).send({
      status: true,
      data: deleteExerciseResponse,
      message: "Exercise Record Deleted"
    })
  } catch (error: any) {
    return res.status(500).send({
      status: false,
      message: error.message
    })
  }
}

/**
 * @summary - Fetch an array of days used by an exercise category: General|Postural
 * @param req
 * @param res
 * @returns
 */
const apiGetExerciseListDays = async (req: Request, res: Response) => {
  try {
    let returnDays = []

    const exerciseParentId: any = req.params.exerciseParentId

    const result = await ExerciseService.listExerciseList({ exerciseParentId })

    if (!Array.isArray(result) || result.length === 0) {
      return res.status(200).send({
        status: true,
        data: [],
        message: "Exercise record fetched"
      })
    }

    let days = result.filter(obj => (Array.isArray(obj.day) && obj.day.length > 0))

    for (let i = 0; i < days.length; i++) {
      if (Array.isArray(days[i].day) && days[i].day.length > 0) returnDays.push(...days[i].day)
    }

    return res.status(200).send({
      status: true,
      data: [...new Set(returnDays)],
      message: "ExerciseList days fetched"
    })
  } catch (error: any) {
    return res.status(500).send({
      status: false,
      message: error.message
    })
  }
}

/**
 * @summary - Search exercises in exercise list model
 * @param req
 * @param res
 * @returns
 */
const searchExerciseList = async (req: Request, res: Response) => {
  let statusCode = 500

  try {
    const pageNo: any = Number(req.query.pageNo) || 1
    const perPage: any = Number(req.query.perPage) || 10
    const tagId: any = req.query.tagId
    const searchString: any = req.query.searchString
    const exerciseType: any = req.query.exerciseType
    const day: any = req.query.day
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
    if (tagId) obj.tagId = tagId
    if (exerciseType) obj.exerciseParentName = new RegExp(exerciseType, "i")
    if (day) obj.day = day
    if (tagId || day || exerciseType) match["$match"] = obj

    if (searchString) {
      payload["$match"] = { $text: { $search: `${searchString}`.trim() } }
    }
    else {
      payload["$match"] = obj
    }

    // determine what fields to generate
    project["$project"] = { title: 1, description: 1, video: 1, day: 1, tag: 1, tagId: 1, exerciseParentId: 1, exerciseParentName: 1 }

    // manage sorting
    if (sortField) sort["$sort"] = { [sortField]: sortOrder }

    arr.push(payload)
    arr.push(project)
    if (Object.keys(match).length > 0) arr.push(match)
    if (Object.keys(sort).length > 0) arr.push(sort)

    // if (exerciseType) payload.exerciseParentName = new RegExp(exerciseType, "i")
    // if (day) payload.day = day
    // if (tagId) payload.tagId = tagId

    const searchResponse: any = await ExerciseService.retrieveExerciseWithPaginateAggregate(arr, options)
    return res.status(200).send({
      status: true,
      data: searchResponse.docs,
      totalPages: searchResponse.totalPages,
      totalQuestions: searchResponse.totalDocs,
      message: "Exercise Records retrieved"
    })
  } catch (error: any) {
    return res.status(statusCode).send({
      status: false,
      message: error.message
    })
  }
}

/**
 * @summary - Get exercise list by tag id
 * @param req
 * @param res
 * @returns
 */
const apiGetExerciseListByTagId = async (req: Request, res: Response) => {
  let statusCode = 500

  try {
    const tagId: any = req.params.tagId

    const result = await ExerciseService.listExerciseList({ tagId })

    return res.status(200).send({
      status: true,
      data: result
    })
  } catch (error: any) {
    return res.status(statusCode).send({
      status: false,
      message: error.message
    })
  }
}

const apiDeleteArticleInTag = async (req: Request, res: Response) => {
  let statusCode = 500

  try {
    const exerciseId: any = req.params.id
    const tagId: any = req.params.tagId
    const articleId: any = req.params.articleId

    let retrieveExerciseResponse = await ExerciseService.retrieveExercise({ _id: new mongoose.Types.ObjectId(exerciseId) })

    if (!retrieveExerciseResponse) {
      statusCode = 400
      throw new Error("Could not find exercise")
    }

    retrieveExerciseResponse = retrieveExerciseResponse.toObject()

    // find tag
    const tag: any = retrieveExerciseResponse.tags.find((v: any) => JSON.stringify(v._id) === JSON.stringify(tagId))

    const articles = tag.articles.filter((v: any) => JSON.stringify(v._id) !== JSON.stringify(articleId))

    const query = { $set: { "tags.$.articles": articles } }

    const updateExerciseResponse = await ExerciseService.updateExerciseWithSet({ _id: exerciseId, "tags._id": tagId }, query)
    const response = updateExerciseResponse?.toObject()?.tags.find((v: any) => JSON.stringify(v._id) === JSON.stringify(tagId))
    return res.status(200).send({
      status: true,
      data: response,
      message: "Exercise Record Updated"
    })
  } catch (error: any) {
    return res.status(statusCode).send({
      status: false,
      message: error.message
    })
  }
}

const apiDeleteTag = async (req: Request, res: Response) => {
  try {
    const exerciseId: any = req.params.id
    const tagId: any = req.params.tagId

    const tag = {
      _id: tagId
    }

    const query = { $pull: { tags: tag } }

    const updateExerciseResponse = await ExerciseService.updateExercise(exerciseId, query)
    return res.status(200).send({
      status: true,
      data: updateExerciseResponse,
      message: "Exercise Record Updated"
    })
  } catch (error: any) {
    return res.status(500).send({
      status: false,
      message: error.message
    })
  }
}

const apiListExercises = async (req: Request, res: Response) => {
  const statusCode = 500

  try {
    const result = await ExerciseService.listExercises({})

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

const apiRetrieveExercise = async (req: Request, res: Response) => {
  try {
    const exerciseId: any = req.params.id?.toString()
    const retrieveExerciseResponse = await ExerciseService.retrieveExercise({ _id: new mongoose.Types.ObjectId(exerciseId) })
    if (retrieveExerciseResponse !== null) {
      return res.status(200).send({
        status: true,
        data: retrieveExerciseResponse,
        message: "Exercise Record Fetched"
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

const apiRetrieveExerciseByTitle = async (req: Request, res: Response) => {
  try {
    const title: any = req.params.title?.toString()
    const retrieveExerciseResponse: any = await ExerciseService.retrieveExercise({ title: new RegExp(title, "i") })
    if (retrieveExerciseResponse !== null) {
      let tags: any = retrieveExerciseResponse.tags
      tags = tags.map((obj: any) => ({ _id: obj._id, title: obj.title }))
      return res.status(200).send({
        status: true,
        data: tags,
        message: "Exercise Record Fetched"
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

const apiUpdateExercise = async (req: Request, res: Response) => {
  try {
    const title: any = req.body.title
    const exerciseId: any = req.params.id

    const updateExerciseResponse = await ExerciseService.updateExercise(exerciseId, { title })
    return res.status(200).send({
      status: true,
      data: updateExerciseResponse,
      message: "Exercise Record Updated"
    })
  } catch (error: any) {
    return res.status(500).send({
      status: false,
      message: error.message
    })
  }
}

const apiDeleteExercise = async (req: Request, res: Response) => {
  try {
    const exerciseId: any = req.params.id
    const deleteExerciseResponse = await ExerciseService.deleteExercise(exerciseId)
    return res.status(200).send({
      status: true,
      data: deleteExerciseResponse,
      message: "Exercise Record Deleted"
    })
  } catch (error: any) {
    return res.status(500).send({
      status: false,
      message: error.message
    })
  }
}

const apiUploadVideoTest = async (req: Request, res: Response) => {
  const file: any = req.files?.video

  let url = await CommonFunctions.getUploadURL(file)

  return res.status(200).send({
    status: true,
    data: url
  })
}

const apiUpdateMany = async (req: Request, res: Response) => {
  let res_: any = await ExerciseService.updateMany()

  return res.status(200).send({
    status: true,
    data: res_
  })
}



export default { apiListExercises, apiRetrieveExercise, apiCreateExercise, apiUpdateExercise, apiDeleteExercise, apiAddNewExercisesToExerciseList, apiAddTag, apiDeleteTag, apiUpdateExerciseList, apiDeleteArticleInTag, apiRetrieveExerciseByTitle, apiUploadVideoTest, searchExerciseList, apiGetSingleExerciseItem, apiDeleteExerciseListItem, apiGetExerciseListByTagId, apiGetExerciseListDays, apiUpdateTag, apiUpdateMany, apiGetPresignedUrl }
