import { Document, FilterQuery } from "mongoose"

import { ExerciseDocument } from "../interfaces/exercise.interface"
import { ExerciseListDocument } from "../interfaces/exerciseList.interface"
import Exercise from "../models/exercise.model"
import ExerciseList from "../models/exerciseList.model"

/**
 * Used to create Exercise record in DB
 *
 * @param payload
 * @returns Object | null
 */
const createExercise = async (payload: Document<ExerciseDocument>) => {
    try {
        const exercise = await Exercise.create(payload)
        if (exercise) {
            return exercise
        }
        throw new Error(`Sorry some errors occurred while creating Exercise`)
    } catch (error: any) {
        throw new Error(error)
    }
}

/**
 * Used to create Exercise List record in DB
 *
 * @param payload
 * @returns Object | null
 */
 const createExerciseList = async (payload: Document<ExerciseListDocument>) => {
    try {
        const exercise = await ExerciseList.create(payload)
        if (exercise) {
            return exercise
        }
        throw new Error(`Sorry some errors occurred while creating Exercise List`)
    } catch (error: any) {
        throw new Error(error)
    }
}

/**
 * Used to update exercise in exercise list
 *
 * @param exerciseListId
 * @param payload
 * @returns ExerciseListDocument | null
 */
 const updateExerciseList = async (exerciseListId: string, payload: any): Promise<ExerciseListDocument | null> => {
    try {
        const exercise: any = await ExerciseList.findByIdAndUpdate(exerciseListId, payload, { new: true })
        if (exercise) {
            return exercise
        }
        throw new Error(`exercise details not found`)
    } catch (error: any) {
        throw new Error(error)
    }
}

const updateExerciseTags = async (obj: any, payload: any): Promise<ExerciseListDocument | null> => {
  try {
      const exercise: any = await Exercise.findOneAndUpdate(obj, payload, { new: true })
      if (exercise) {
          return exercise
      }
      throw new Error(`exercise details not found`)
  } catch (error: any) {
      throw new Error(error)
  }
}

/**
 * Used to find a single exercise item from the ExerciseList collection
 * @param query
 * @returns ExerciseListDocument | null
 */
const retrieveExerciseItem = async (query: FilterQuery<ExerciseListDocument>): Promise<ExerciseListDocument | undefined> => {
    try {
        const exercise: any = await ExerciseList.findOne(query).exec()
        if (exercise) {
            return exercise
        }
        throw new Error(`Sorry some errors occurred while retriving exercise`)
    } catch (error: any) {
        throw new Error(error.message)
    }
}

/**
 * Used to find exercise list by providing filter query
 * @param query
 * @returns ExerciseListDocument | null
 */
const listExerciseList = async (query: FilterQuery<ExerciseListDocument>): Promise<ExerciseListDocument | undefined> => {
    try {
        const exercise: any = await ExerciseList.find(query ? query : {})
        if (exercise) {
            return exercise
        }
        throw new Error(`Sorry some errors occurred while retrieving Exercise list`)
    } catch (error: any) {
        throw new Error(error.message)
    }
}

/**
 * Used to delete exercise record from ExerciseList collection
 * @param exerciseId
 * @returns
 */
const deleteExerciseItem = async (exerciseId: string) => {
    try {
        const exercise = await ExerciseList.findByIdAndDelete(exerciseId)
        return exercise
    } catch (error: any) {
        throw new Error(error)
    }
}

/**
 * Used to find exercise by providing filter query
 * @param query
 * @returns ExerciseDocument | null
 */
const listExercises = async (query: FilterQuery<ExerciseDocument>): Promise<ExerciseDocument | undefined> => {
    try {
        const exercise: any = await Exercise.find(query ? query : {})
        if (exercise) {
            return exercise
        }
        throw new Error(`Sorry some errors occurred while retriving Exercises`)
    } catch (error: any) {
        throw new Error(error.message)
    }
}

/**
 * Used to find exercise by providing filter query
 * @param query
 * @returns ExerciseDocument | null
 */
 const retrieveExercise = async (query: FilterQuery<ExerciseDocument>): Promise<ExerciseDocument | undefined> => {
    try {
        const exercise: any = await Exercise.findOne(query).exec()
        if (exercise) {
            return exercise
        }
        throw new Error(`Sorry some errors occurred while retriving exercise`)
    } catch (error: any) {
        throw new Error(error.message)
    }
}

/**
 * Used to update exercise details by userId
 *
 * @param exerciseId
 * @param payload
 * @returns ExerciseDocument | null
 */
const updateExercise = async (exerciseId: string, payload: any): Promise<ExerciseDocument | null> => {
    try {
        const exercise: any = await Exercise.findByIdAndUpdate(exerciseId, payload, { new: true })
        if (exercise) {
            return exercise
        }
        throw new Error(`exercise details not found`)
    } catch (error: any) {
        throw new Error(error)
    }
}

/**
 * Used to update exercise details with $set param
 *
 * @param exerciseObj
 * @param payload
 * @returns ExerciseDocument | null
 */
const updateExerciseWithSet = async (exerciseObj: any, payload: any): Promise<ExerciseDocument | null> => {
    try {
        const exercise: any = await Exercise.findOneAndUpdate(exerciseObj, payload, { new: true})
        if (exercise) {
            return exercise
        }
        throw new Error(`exercise details not found`)
    } catch (error: any) {
        throw new Error(error)
    }
}

/**
 * Used to delete exercise record from DB
 * @param exerciseId
 * @returns
 */
 const deleteExercise = async (exerciseId: string) => {
    try {
        const exercise = await Exercise.findByIdAndDelete(exerciseId)
        return exercise
    } catch (error: any) {
        throw new Error(error)
    }
}

const retrieveExercisesWithPaginate = async (query: FilterQuery<ExerciseDocument>, options: any): Promise<ExerciseDocument | null> => {
    try {
        const exercises: any = await Exercise.paginate(query, options)
        // console.log(exercises)
        if (exercises) {
            return exercises
        }
        throw new Error(`Sorry some errors occurred while retriving exercises`)
    } catch (error: any) {
        throw new Error(error.message)
    }
}

const retrieveExerciseListWithPaginate = async (query: FilterQuery<ExerciseListDocument>, options: any): Promise<ExerciseListDocument | null> => {
    try {
        const exercises: any = await ExerciseList.paginate(query, options)
        // console.log(exercises)
        if (exercises) {
            return exercises
        }
        throw new Error(`Sorry some errors occurred while retriving exercises`)
    } catch (error: any) {
        throw new Error(error.message)
    }
}

/**
 * @summary - We use the mongoose aggregate plugin to create pipelines
 * @param query
 * @param options
 * @returns
 */
const retrieveExerciseWithPaginateAggregate = async (query: any, options: any): Promise<any | null> => {
  try {
    const myAggregate = ExerciseList.aggregate(query)
    // @ts-expect-error
      const response: any = await ExerciseList.aggregatePaginate(myAggregate, options)
      if (response) {
          return response
      }
      throw new Error(`Sorry some errors occurred while retriving exercises`)
  } catch (error: any) {
      throw new Error(error.message)
  }
}

const updateMany = async () => {
  try {
      return await ExerciseList.updateMany(
        {},
        [{ $set: { tag: ["Weak abdominal/core muscles"], tagId: ["63ca9af8b5c4eefb6b39a1e8"] } }]
      )
  } catch (error: any) {
      throw new Error(error.message)
  }
}

export default {
    updateMany,
    listExercises,
    createExercise,
    retrieveExercise,
    updateExercise,
    updateExerciseWithSet,
    deleteExercise,
    retrieveExercisesWithPaginate,
    createExerciseList,
    updateExerciseList,
    retrieveExerciseListWithPaginate,
    retrieveExerciseItem,
    deleteExerciseItem,
    listExerciseList,
    updateExerciseTags,
    retrieveExerciseWithPaginateAggregate
}
