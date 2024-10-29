import HttpStatusCode from "http-status-codes"
import mongoose from "mongoose"

import { Request, Response } from "../interfaces/express.interface"
import NutritionExampleService from "../services/nutrition-example.service"
import CommonFunctions from "../utilities/common"

const apiRetrieveNutritionExample = async (req: Request, res: Response) => {
  try {
    const retrieveNutritionExamplesResponse: any = await NutritionExampleService.listNutritionExample({})
    if (Array.isArray(retrieveNutritionExamplesResponse)) {
      return res.status(200).send({
        status: true,
        data: retrieveNutritionExamplesResponse,
        message: "Nutrition example Record Fetched"
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

const apiSingleRetrieveNutritionExample = async (req: Request, res: Response) => {
  try {
    const id: any = req.params.id?.toString()
    const retrieveNutritionExamplesResponse: any = await NutritionExampleService.retrieveSingleNE({ _id: new mongoose.Types.ObjectId(id) })
    if (retrieveNutritionExamplesResponse) {
      return res.status(200).send({
        status: true,
        data: retrieveNutritionExamplesResponse,
        message: "Nutrition example Record Fetched"
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

const apiCreateNutritionExample = async (req: Request, res: Response) => {
  try {
    const payload: any = req.body ? req.body : undefined
    if (payload === undefined || !payload.categoryName) {
      return res.status(HttpStatusCode.BAD_REQUEST).send({
        status: false,
        message: "Invalid Payload"
      })
    }
    const createResponse = await NutritionExampleService.createNutritionExample({ categoryName: payload.categoryName })
    return res.status(200).send({
      status: true,
      data: createResponse,
      message: "Nutrition example Record Created"
    })
  } catch (error: any) {
    return res.status(500).send({
      status: false,
      message: error.message
    })
  }
}

const apiAddMeal = async (req: Request, res: Response) => {
  let statusCode = 500

  try {
    const id: any = req.params.id
    let categoryName = ""
    const file: any = req.files?.image
    const title: any = req.body.title
    const ingredients: any = req.body.ingredients
    const recipe: any = req.body.recipe
    const nutrition: any = req.body.nutrition
    const meal: any = req.body.meal
    const mealType: any = req.body.mealType

    CommonFunctions.validateRequestForEmptyValues({ title, ingredients, recipe, nutrition })

    if (!CommonFunctions.isNumber(meal)) {
      statusCode = 400
      throw new Error("'meal' has to be a numeric value")
    }

    // get nutrition example
    let retrieveNutritionExamplesResponse: any = await NutritionExampleService.retrieveSingleNE({ _id: new mongoose.Types.ObjectId(id) })

    if (!retrieveNutritionExamplesResponse) {
      statusCode = 400
      throw new Error(`Nutrition example does not exist with id: ${id}`)
    }

    retrieveNutritionExamplesResponse = retrieveNutritionExamplesResponse.toObject()

    categoryName = retrieveNutritionExamplesResponse.categoryName

    const mealObject: any = { meal, categoryName, categoryId: id }

    if (file) {
      const image = await CommonFunctions.getUploadURL(file)
      mealObject["image"] = image
    }

    if (title) {
      mealObject["title"] = title
    }

    if (ingredients) {
      mealObject["ingredients"] = ingredients
    }

    if (mealType) {
      mealObject["mealType"] = mealType
    }

    if (recipe) {
      mealObject["recipe"] = recipe
    }

    if (nutrition) {
      mealObject["nutrition"] = nutrition
    }

    const createResponse = await NutritionExampleService.createMeal(mealObject)
    return res.status(200).send({
      status: true,
      data: createResponse,
      message: "Nutrition Example Meal Record Created"
    })
  } catch (error: any) {
    return res.status(statusCode).send({
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
const searchMeals = async (req: Request, res: Response) => {
  let statusCode = 500

  try {
    const pageNo: any = Number(req.query.pageNo) || 1
    const perPage: any = Number(req.query.perPage) || 10
    const categoryId: any = req.query.categoryId
    const searchString: any = req.query.searchString
    const dietType:any = req.query.dietType
    const mealType: any = req.query.mealType
    // const mealType: any = req.query.mealType ? Number(req.query.mealType) : ""
    const sortField: any = req.query.sortField
    let sortOrder: any = req.query.sortOrder || "asc"

    // manage sort order
    if (sortOrder === "asc") sortOrder = 1
    else sortOrder = -1

    const payload: any = {}
    const match: any = {}
    const sort: any = {}
    const arr: any = []
    const options = { page: pageNo, limit: perPage }

    // manage searh filters
    const obj: any = {}
    if (categoryId) obj.categoryId = categoryId
    if (mealType) obj.mealType = mealType
    if (dietType) obj.dietType = dietType
    if (categoryId || mealType || dietType) match["$match"] = obj

    if (searchString) {
      payload["$match"] = { $text: { $search: `${searchString}`.trim() } }
    }
    else {
      payload["$match"] = obj
    }

    // manage sorting
    if (sortField) sort["$sort"] = { [sortField]: sortOrder }

    arr.push(payload)
    if (Object.keys(match).length > 0) arr.push(match)
    if (Object.keys(sort).length > 0) arr.push(sort)

    const searchResponse: any = await NutritionExampleService.retrieveMealWithPaginateAggregate(arr, options)
    return res.status(200).send({
      status: true,
      data: searchResponse.docs,
      totalPages: searchResponse.totalPages,
      totalQuestions: searchResponse.totalDocs,
      message: "Meal Records retrieved"
    })
  } catch (error: any) {
    return res.status(statusCode).send({
      status: false,
      message: error.message
    })
  }
}

const apiSingleRetrieveNutritionExampleMeal = async (req: Request, res: Response) => {
  try {
    const mealId: any = req.params.mealId?.toString()
    const retrieveNutritionExamplesResponse: any = await NutritionExampleService.retrieveNutritiionMeal({ _id: new mongoose.Types.ObjectId(mealId) })
    if (retrieveNutritionExamplesResponse) {
      return res.status(200).send({
        status: true,
        data: retrieveNutritionExamplesResponse,
        message: "Nutrition example Record Meal Fetched"
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

const apiRemoveMeal = async (req: Request, res: Response) => {
  let statusCode = 500

  try {
    // const id: any = req.params.id
    const mealId: any = req.params.mealId

    const updateResponse = await NutritionExampleService.deleteNutritionMeal(mealId)
    return res.status(200).send({
      status: true,
      data: updateResponse,
      message: "Nutrition Example Meal Record deleted"
    })
  } catch (error: any) {
    return res.status(statusCode).send({
      status: false,
      message: error.message
    })
  }
}

const apiUpdateNutritionExampleCategory = async (req: Request, res: Response) => {
  try {
    const id: any = req.params.id
    const payload: any = req.body ? req.body : undefined
    if (payload === undefined || !payload.categoryName) {
      return res.status(HttpStatusCode.BAD_REQUEST).send({
        status: false,
        message: "Invalid Payload"
      })
    }

    // update the nutrition example meal documents as well
    await NutritionExampleService.findAndUpdateManyNutritionExampleMeal(id, { categoryName: payload.categoryName })

    // update the nutrition example meal documents as well
    await NutritionExampleService.findAndUpdateManyNutritionExampleMeal(id, { categoryName: payload.categoryName })

    const updateResponse = await NutritionExampleService.updateNutritionExample(id, { categoryName: payload.categoryName })
    return res.status(200).send({
      status: true,
      data: updateResponse,
      message: "Nutrition Example Record Updated"
    })
  } catch (error: any) {
    return res.status(500).send({
      status: false,
      message: error.message
    })
  }
}

const apiUpdateNutritionExampleMeal = async (req: Request, res: Response) => {
  let statusCode = 500

  try {
    // const id: any = req.params.id
    const mealId: any = req.params.mealId
    const file: any = req.files?.image || req.body.image
    const title: any = req.body.title
    const ingredients: any = req.body.ingredients
    const recipe: any = req.body.recipe
    const nutrition: any = req.body.nutrition
    const meal: any = req.body.meal
    const mealType: any = req.body.mealType
    const id: any = req.params.id
    const categoryName: any = req.body.categoryName

    // update category name
    if (categoryName) {
      await NutritionExampleService.findAndUpdateManyNutritionExampleMeal(id, { categoryName })

      try {
        await NutritionExampleService.updateNutritionExample(id, { categoryName })
      }
      catch (e) {
        console.log(e)
      }
    }

    const mealObject: any = {}

    if (CommonFunctions.isNumber(meal)) {
      mealObject["meal"] = meal
    }

    if (file && file !== "null" && !CommonFunctions.stringIsAValidUrl(file)) {
      const image = await CommonFunctions.getUploadURL(file)
      mealObject["image"] = image
    }
    else if (file === null || file === "null") {
      mealObject["image"] = null
    }

    if (title) {
      mealObject["title"] = title
    }

    if (ingredients) {
      mealObject["ingredients"] = ingredients
    }

    if (recipe) {
      mealObject["recipe"] = recipe
    }

    if (nutrition) {
      mealObject["nutrition"] = nutrition
    }

    if (categoryName) {
      mealObject["categoryName"] = categoryName
    }

    if (id) {
      mealObject["categoryId"] = id
    }

    if (mealType) {
      mealObject["mealType"] = mealType
    }

    const updateResponse = await NutritionExampleService.updateMeal(mealId, mealObject)
    return res.status(200).send({
      status: true,
      data: updateResponse,
      message: "Nutrition Example Meal Record Updated"
    })
  } catch (error: any) {
    return res.status(statusCode).send({
      status: false,
      message: error.message
    })
  }
}

const apiDeleteNutritionExample = async (req: Request, res: Response) => {
  try {
    const id: any = req.params.id
    const deleteResponse = await NutritionExampleService.deleteNutritionExample(id)
    return res.status(200).send({
      status: true,
      data: deleteResponse,
      message: "Nutrition Example Record Deleted"
    })
  } catch (error: any) {
    return res.status(500).send({
      status: false,
      message: error.message
    })
  }
}

export default { apiRetrieveNutritionExample, apiSingleRetrieveNutritionExample, apiCreateNutritionExample, apiAddMeal, apiUpdateNutritionExampleCategory, apiUpdateNutritionExampleMeal, apiRemoveMeal, apiDeleteNutritionExample, apiSingleRetrieveNutritionExampleMeal, searchMeals }
