import { DocumentDefinition, FilterQuery } from "mongoose"

import { NutritionExampleMealDocument } from "../interfaces/nutrition-example-meal.interface"
import { NutritionExamplesDocument } from "../interfaces/nutrition-examples.interface"
import NutritionExampleMeal from "../models/nutrition-example-meal.model"
import NutritionExample from "../models/nutrition-examples.model"

/**
 * Used to find nutrition example by providing filter query
 * @param query
 * @returns NutritionExamplesDocument | null
 */
const listNutritionExample = async (query: FilterQuery<NutritionExamplesDocument>): Promise<NutritionExamplesDocument | undefined> => {
    try {
        const nutritionExample: any = await NutritionExample.find(query ? query : {})
        if (nutritionExample) {
            return nutritionExample
        }
        throw new Error(`Sorry some errors occurred while retriving nutrition example`)
    } catch (error: any) {
        throw new Error(error.message)
    }
}


/**
 * Used to find nutrition example by providing filter query
 * @param query
 * @returns NutritionExamplesDocument | null
 */
 const retrieveSingleNE = async (query: FilterQuery<NutritionExamplesDocument>): Promise<NutritionExamplesDocument | undefined> => {
    try {
        const nutritionExample: any = await NutritionExample.findOne(query).exec()
        if (nutritionExample) {
            return nutritionExample
        }
        throw new Error(`Sorry some errors occurred while retriving nutrition example`)
    } catch (error: any) {
        throw new Error(error.message)
    }
}

/**
 * Used to create Nutrition Example record in DB
 *
 * @param payload
 * @returns Object | null
 */
const createNutritionExample = async (payload: DocumentDefinition<NutritionExamplesDocument>) => {
    try {
        const nutritionExample = await NutritionExample.create(payload)
        if (nutritionExample) {
            return nutritionExample
        }
        throw new Error(`Sorry some errors occurred while creating Nutrition Example`)
    } catch (error: any) {
        throw new Error(error)
    }
}

/**
 * Used to create a meal record in DB
 *
 * @param payload
 * @returns Object | null
 */
 const createMeal = async (payload: DocumentDefinition<NutritionExampleMealDocument>) => {
    try {
        const exercise = await NutritionExampleMeal.create(payload)
        if (exercise) {
            return exercise
        }
        throw new Error(`Sorry some errors occurred while creating nutrition meal`)
    } catch (error: any) {
        throw new Error(error)
    }
}

/**
 * Used to update meal
 *
 * @param mealId
 * @param payload
 * @returns NutritionExampleMealDocument | null
 */
const updateMeal = async (mealId: string, payload: any): Promise<NutritionExampleMealDocument | null> => {
    try {
        const result: any = await NutritionExampleMeal.findByIdAndUpdate(mealId, payload, { new: true })
        if (result) {
            return result
        }
        throw new Error(`nutrition meal not found`)
    } catch (error: any) {
        throw new Error(error)
    }
}

/**
 * Used to find a single meal
 * @param query
 * @returns NutritionExampleMealDocument | null
 */
const retrieveNutritiionMeal = async (query: FilterQuery<NutritionExampleMealDocument>): Promise<NutritionExampleMealDocument | undefined> => {
    try {
        const result: any = await NutritionExampleMeal.findOne(query).exec()
        if (result) {
            return result
        }
        throw new Error(`Sorry some errors occurred while retriving nutrition example meal`)
    } catch (error: any) {
        throw new Error(error.message)
    }
}

/**
 * Used to delete nutrition example meal
 * @param mealId
 * @returns
 */
const deleteNutritionMeal = async (mealId: string) => {
    try {
        const result = await NutritionExampleMeal.findByIdAndDelete(mealId)
        return result
    } catch (error: any) {
        throw new Error(error)
    }
}

const retrieveMealWithPaginate = async (query: FilterQuery<NutritionExampleMealDocument>, options: any): Promise<NutritionExampleMealDocument | null> => {
    try {
        const result: any = await NutritionExampleMeal.paginate(query, options)
        if (result) {
            return result
        }
        throw new Error(`Sorry some errors occurred while retriving nutrition example meal`)
    } catch (error: any) {
        throw new Error(error.message)
    }
}

const retrieveMealWithPaginateAggregate = async (query: any, options: any): Promise<any | null> => {
  try {
    const myAggregate = NutritionExampleMeal.aggregate(query)
    // @ts-expect-error
      const response: any = await NutritionExampleMeal.aggregatePaginate(myAggregate, options)
      if (response) {
          return response
      }
      throw new Error(`Sorry some errors occurred while retriving meals`)
  } catch (error: any) {
      throw new Error(error.message)
  }
}

/**
 * Used to update nutrition example details by userId
 *
 * @param id
 * @param payload
 * @returns NutritionExamplesDocument | null
 */
const updateNutritionExample = async (id: string, payload: any): Promise<NutritionExamplesDocument | null> => {
    try {
        const nutritionExample: any = await NutritionExample.findByIdAndUpdate(id, payload, { new: true })
        if (nutritionExample) {
            return nutritionExample
        }
        throw new Error(`nutrition example not found`)
    } catch (error: any) {
        throw new Error(error)
    }
}

/**
 * @summary - Update many
 * @param id String
 * @param payload any
 * @returns
 */
const findAndUpdateManyNutritionExampleMeal = async (id: string, payload: any) => {
  try {
    const result: any = await NutritionExampleMeal.updateMany({ categoryId: id }, payload)
    if (result) {
      console.log(result)
      return result
    }
    throw new Error(`nutrition example meal not found`)
  } catch (error: any) {
    throw new Error(error)
  }
}

/**
 * Used to update nutrition example details with $set param
 *
 * @param exerciseObj
 * @param payload
 * @returns NutritionExamplesDocument | null
 */
 const updateNutritonExampleWithSet = async (exerciseObj: any, payload: any): Promise<NutritionExamplesDocument | null> => {
    try {
        const nutritionExample: any = await NutritionExample.findOneAndUpdate(exerciseObj, payload, { new: true})
        if (nutritionExample) {
            return nutritionExample
        }
        throw new Error(`Nutrition example details not found`)
    } catch (error: any) {
        throw new Error(error)
    }
}

/**
 * Used to delete nutrition exzmple record from DB
 * @param id
 * @returns
 */
const deleteNutritionExample = async (id: string) => {
    try {
        const result = await NutritionExample.findByIdAndDelete(id)
        return result
    } catch (error: any) {
        throw new Error(error)
    }
}

export default { listNutritionExample, retrieveSingleNE, createNutritionExample, updateNutritionExample, updateNutritonExampleWithSet, deleteNutritionExample, createMeal, updateMeal, retrieveNutritiionMeal, deleteNutritionMeal, retrieveMealWithPaginate, findAndUpdateManyNutritionExampleMeal, retrieveMealWithPaginateAggregate }
