import { DocumentDefinition, FilterQuery, UpdateQuery } from "mongoose"

import { QuestionnaireDocument } from "../interfaces/questionnaire.interface"
// import Exercise from "../models/exercise.model"
import ExerciseList from "../models/exerciseList.model"
import Program from "../models/program.model"
import Questionnaire from "../models/questionnaire.model"
import User from "../models/user.model"


/**
 * Used to create Questionnaire record in DB
 *
 * @param payload
 * @returns Object | null
 */
const createQuestionnaire = async (payload: DocumentDefinition<QuestionnaireDocument>) => {
  try {
    const questionnaire = await Questionnaire.create(payload)
    if (questionnaire) {
      return questionnaire
    }
    throw new Error(`Sorry some errors occurred while creating Questionnaire`)
  } catch (error: any) {
    throw new Error(error)
  }
}



/**
 * Used to find microcategory by providing filter query
 * @param query
 * @returns QuestionnaireDocument | null
 */
const retrieveQuestionnaire = async (query: FilterQuery<QuestionnaireDocument>): Promise<QuestionnaireDocument | null> => {
  try {
    const questionnaire: any = await Questionnaire.findOne(query).exec()
    if (questionnaire) {
      return questionnaire
    }
    else if (questionnaire === null) {
      return null
    }
    throw new Error(`Sorry some errors occurred while retriving Questionnaire`)
  } catch (error: any) {
    throw new Error(error.message)
  }
}

/**
 * Used to find next question by providing filter query
 * @param query
 * @returns QuestionnaireDocument | null
 */
const retrieveNextQuestionnaire = async (query: FilterQuery<QuestionnaireDocument>): Promise<QuestionnaireDocument | null> => {
  try {
    const questionnaire: any = await Questionnaire.find(query).sort({ questionNumber: 1 }).limit(1)
    if (questionnaire) {
      return questionnaire
    }
    else if (questionnaire === null) {
      return null
    }
    throw new Error(`Sorry some errors occurred while retriving Questionnaire`)
  } catch (error: any) {
    throw new Error(error.message)
  }
}

const retrieveQuestionnairesWithPaginate = async (query: FilterQuery<QuestionnaireDocument>, options: any): Promise<QuestionnaireDocument | null> => {
  try {
    const questionnaires: any = await Questionnaire.paginate(query, options)
    if (questionnaires) {
      return questionnaires
    }
    throw new Error(`Sorry some errors occurred while retriving Questionnaires`)
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
const retrieveQuestionnaireWithPaginateAggregate = async (query: any, options: any): Promise<any | null> => {
  try {
    const myAggregate = Questionnaire.aggregate(query)
    // @ts-expect-error
    const response: any = await Questionnaire.aggregatePaginate(myAggregate, options)
    if (response) {
      return response
    }
    throw new Error(`Sorry some errors occurred while retriving questionnaire`)
  } catch (error: any) {
    throw new Error(error.message)
  }
}

/**
 * Used to find user by providing filter query
 * @param query
 * @returns QuestionnaireDocument | null
 */
const listQuestionnaires = async (query: FilterQuery<QuestionnaireDocument>): Promise<QuestionnaireDocument | undefined> => {
  try {
    let questionnaireFacet = {
      $facet: {
        paginatedResults: [{ $skip: query.perPage * (query.pageNo - 1) }, { $limit: Number(query.perPage) }],
        totalCount: [{ $count: 'count' }]
      }
    }
    const listQuestionnairesByPaginationResponse: any = await Questionnaire.aggregate([questionnaireFacet])

    if (listQuestionnairesByPaginationResponse) {
      return listQuestionnairesByPaginationResponse
    }
    throw new Error(`listQuestionnaires details not found`)
  } catch (error: any) {
    throw new Error(error.message)
  }
}

/**
 * Provides all questionnaires
 * @param query
 * @returns QuestionnaireDocument | null
 */
const listAllQuestionnaires = async (query: FilterQuery<QuestionnaireDocument>): Promise<QuestionnaireDocument | undefined> => {
  try {
    const questionnaires: any = await Questionnaire.find(query ? query : {})
    if (questionnaires) {
      return questionnaires
    }
    throw new Error(`Sorry some errors occurred while retriving Questionnaires`)
  } catch (error: any) {
    throw new Error(error.message)
  }
}

/**
 * Provides all questionnaires sorted by created at
 * @param query
 * @returns QuestionnaireDocument | null
 */
const listAllQuestionnairesSortedByCreatedAt = async (query: FilterQuery<QuestionnaireDocument>): Promise<QuestionnaireDocument | undefined> => {
  try {
    const questionnaires: any = await Questionnaire.find(query ? query : {}).sort({ createdAt: 1 }).exec()
    if (Array.isArray(questionnaires) && questionnaires.length > 0) {
      return questionnaires[0]
    }
    throw new Error(`Sorry some errors occurred while retriving Questionnaires`)
  } catch (error: any) {
    throw new Error(error.message)
  }
}


/**
 * Used to update questionnaire details by userId
 *
 * @param categoryId
 * @param payload
 * @returns QuestionnaireDocument | null
 */
const updateQuestionnaire = async (questionnaireId: string, payload: UpdateQuery<QuestionnaireDocument>): Promise<QuestionnaireDocument | null> => {
  try {
    const questionnaire: any = await Questionnaire.findByIdAndUpdate(questionnaireId, payload, { new: true })
    if (questionnaire) {
      return questionnaire
    }
    throw new Error(`Questionnaire details not found`)
  } catch (error: any) {
    throw new Error(error)
  }
}

/**
 * Used to delete questionnaire record from DB
 * @param categoryId
 * @returns
 */
const deleteQuestionnaire = async (questionnaireId: string) => {
  try {
    const questionnaire = await Questionnaire.findByIdAndDelete(questionnaireId)
    return questionnaire
  } catch (error: any) {
    throw new Error(error)
  }
}

const getExercise = async (id: any) => {
  let result: any = await ExerciseList.findOne({ "_id": id }).exec()

  if (!result) {
    throw new Error("Exercise not found")
  }

  result = result.toObject()

  return result ? { ...result, isComplete: false } : null
}

const getAllGeneralExercises = async (exerciseCount?: any) => {
  let exerciseList: any = await ExerciseList.find({ exerciseParentName: { $regex: /General/, $options: 'i' } }).limit(exerciseCount)
  for (let jr of exerciseList) {
    if (jr && jr.toObject) {
      jr = jr.toObject()
      jr.isComplete = false
    }
  }
  exerciseList = exerciseList.map((t: any) => ({ ...t?.toObject(), isComplete: false }))
  return [...exerciseList]
}

const generateTemplatesArray = (exerciseList: any) => {
  let templates = []

  let days: Record<string, any> = {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    // friday: [ ],
    saturday: [],
    sunday: [],
  }

  let exerciseList_ = [...exerciseList]

  for (let i = 1; i <= 12; i++) {
    if (exerciseList_.length > 1) {
      let days_ = Object.keys(days)
      for (let day__ of days_) {
        let arr = days[day__]
        if (arr.length === 2) {
          continue
        }

        days[day__].push(exerciseList_[0])

        if (!exerciseList_[1]) {
          days[day__].push(exerciseList[0])
        }
        else {
          days[day__].push(exerciseList_[1])
        }

        exerciseList_.shift()
        if (exerciseList_.length > 0) {
          exerciseList_.shift()
        }

        if (exerciseList_.length === 0) {
          exerciseList_ = [...exerciseList]
        }
      }
    }
    else {
      days.monday.push(...exerciseList)
      days.tuesday.push(...exerciseList)
      days.wednesday.push(...exerciseList)
      days.thursday.push(...exerciseList)
      days.saturday.push(...exerciseList)
      days.sunday.push(...exerciseList)
    }

    // remove duplicates
    for (let v of Object.keys(days)) {
      days[v] = days[v].filter((t: any, i: any, a: any) => a.findIndex((v2: any) => (JSON.stringify(v2._id) === JSON.stringify(t._id))) === i)
    }

    console.log(JSON.stringify(days))

    templates.push({ week: i, weekCompleted: false, days })

    days = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      // friday: [ ],
      saturday: [],
      sunday: [],
    }
  }

  return { templates }
}

const removeTemplateDuplicates = (templates_: any) => {
  let templates = [...templates_]

  for (let q of templates) {
    let days = { ...q.days }

    for (let j of Object.keys(days)) {
      // @ts-ignore
      const filtered = days[j].filter((v: any, i: any, a: any) => a.findIndex((v2: any) => (v2._id?.toString() === v._id?.toString())) === i)
      days[j] = filtered
    }

    q.days = { ...days }
  }

  return templates
}
const generateTemplatesArrayForFirstTime = (exerciseList: any) => {
  try {
    let templates = []

    let days: Record<string, any> = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    }

    for (let i = 1; i <= 13; i++) {
      let days_ = Object.keys(days)
      for (let day__ of days_) {
        let arr = days[day__]
        if (arr.length === 1) {
          continue
        }

        days[day__].push(exerciseList[0])

        if (!exerciseList[1]) {
          days[day__].push(exerciseList[0])
        }
        // else {
        //   days[day__].push(exerciseList_[1])
        // }

        // exerciseList_.shift()
        if (exerciseList.length > 0) {
          exerciseList.shift()
        }

        if (exerciseList.length === 0) {
          exerciseList = [...exerciseList]
        }
      }
      // remove duplicates
      for (let v of Object.keys(days)) {
        days[v] = days[v].filter((t: any, i: any, a: any) => a.findIndex((v2: any) => (JSON.stringify(v2._id) === JSON.stringify(t._id))) === i)
      }

      templates.push({ week: i, weekCompleted: false, days })

      days = {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: [],
      }
    }

    return { templates }
  } catch (error: any) {
    console.log(error.message)
  }

}
/**
 * @summary - Generate an exercise program for a user
 * @param userId
 */
const generateProgramForUser = async (userId: any) => {

  let problems_ = []
  let answers_ = []

  let user = await User.findById(userId)
  if (!user) throw new Error("Cannot generate exercise program. User does not exist")

  user = user.toObject()

  // cache user provided answers
  let answers: any = user.questionnaireAnswers
  if (!answers || Object.keys(answers).length === 0) throw new Error("User has not provided any answers.")
  answers_ = Object.values(answers)
  problems_ = [...answers_]

  // Exercises from phase 1 from 1 problem
  if (problems_.length === 1) {
    let generalExerciseList = await getAllGeneralExercises()
    let templates: any = generateTemplatesArrayForFirstTime(generalExerciseList)?.templates
    templates = removeTemplateDuplicates(templates)
    await Program.findOneAndUpdate({ userId }, { $set: { templates, userId } }, { upsert: true })
    // ==============
    // let generalExerciseList = await getAllGeneralExercises()
    // let templates = generateTemplatesArrayForFirstTime(generalExerciseList)
    // templates = removeTemplateDuplicates(templates)
    // await Program.findOneAndUpdate({ userId }, { $set: { templates, userId } }, { upsert: true })


    // let problem: any = problems_[0]
    // problem = problem.questionnaire
    // let queryBlock = problem.queryBlock.find((v: any) => (v.selectedOption?.toLowerCase() !== "no"))

    // if (queryBlock.exerciseType?.toLowerCase() === "manual" || Number(queryBlock.exerciseCount) === 0) {
    //   if (!Array.isArray(queryBlock.exerciseList) || queryBlock.exerciseList.length === 0) {
    //     throw new Error("Something went wrong.")
    //   }

    //   let exerciseList = queryBlock.exerciseList

    //   for (let i = 0; i < exerciseList.length; i++) {
    //     exerciseList[i] = await getExercise(exerciseList[i])
    //   }

    //   let exerciseList_ = [...exerciseList]

    //   let templates = generateTemplatesArray(exerciseList_)?.templates
    //   templates = removeTemplateDuplicates(templates)
    //   await Program.findOneAndUpdate({ userId }, { $set: { templates, userId } }, { upsert: true })
    // }
    // else if (queryBlock.exerciseType?.toLowerCase() === "random" || Number(queryBlock.exerciseCount) > 0) {
    //   const exerciseCount = Number(queryBlock.exerciseCount) || 1
    //   let exerciseList_ = await getAllGeneralExercises(exerciseCount)
    //   let templates = generateTemplatesArray(exerciseList_)?.templates
    //   templates = removeTemplateDuplicates(templates)
    //   await Program.findOneAndUpdate({ userId }, { $set: { templates, userId } }, { upsert: true })
    // }
    // else {
    //   throw new Error("Failed to create an exercise program.")
    // }
  }

  // Exercises plan out of more than one problem
  // else if (problems_.length >= 2) {
  //   let days: Record<string, any> = {
  //     monday: [],
  //     tuesday: [],
  //     wednesday: [],
  //     thursday: [],
  //     saturday: [],
  //     sunday: [],
  //   }

  //   let templates: any = []

  //   for (let problem__ of problems_) {
  //     let problem: any = problem__
  //     problem = problem.questionnaire
  //     let queryBlock = problem.queryBlock.find((v: any) => (v.selectedOption?.toLowerCase() !== "no"))

  //     if (!queryBlock?.exerciseType) {
  //       continue
  //     }

  //     if (queryBlock.exerciseType?.toLowerCase() === "manual" || Number(queryBlock.exerciseCount) === 0) {
  //       if (!Array.isArray(queryBlock.exerciseList) || queryBlock.exerciseList.length === 0) {
  //         continue
  //       }
  //       let exerciseList: Array<Object> = queryBlock.exerciseList
  //       for (let i = 0; i < exerciseList.length; i++) {
  //         exerciseList[i] = await getExercise(exerciseList[i])
  //       }
  //       // cache list of exercises from problem 1
  //       let exerciseList_ = [...exerciseList]
  //       for (let i = 1; i <= 12; i++) {
  //         if (exerciseList_.length > 1) {
  //           let days_ = Object.keys(days)
  //           for (let day__ of days_) {
  //             let arr = days[day__]

  //             if (problems_.length === 2) {
  //               if (arr.length === 4) {
  //                 continue
  //               }

  //               days[day__].push(exerciseList_[0])
  //               if (!exerciseList_[1]) {
  //                 days[day__].push(exerciseList[0])
  //               }
  //               else {
  //                 days[day__].push(exerciseList_[1])
  //               }
  //             }
  //             else {
  //               if (arr.length === 5) {
  //                 continue
  //               }

  //               days[day__].push(exerciseList_[0])
  //               days[day__].push(exerciseList_[1])
  //               days[day__].push(exerciseList_[2])
  //               days[day__].push(exerciseList_[3])
  //               if (!exerciseList_[4]) {
  //                 days[day__].push(exerciseList[0])
  //               }
  //               else {
  //                 days[day__].push(exerciseList_[4])
  //               }
  //             }

  //             exerciseList_.shift()

  //             if (exerciseList_.length > 0) {
  //               exerciseList_.shift()
  //             }
  //             if (exerciseList_.length === 0) {
  //               exerciseList_ = [...exerciseList]
  //             }
  //           }
  //         }
  //         else {
  //           days.monday.push(...exerciseList)
  //           days.tuesday.push(...exerciseList)
  //           days.wednesday.push(...exerciseList)
  //           days.thursday.push(...exerciseList)
  //           days.saturday.push(...exerciseList)
  //           days.sunday.push(...exerciseList)
  //         }

  //         if (templates.find((u: any) => (u.week === i))) {
  //           for (let template__ of templates) {
  //             if (template__.week === i) {
  //               if (template__.days) {
  //                 template__.days.monday.push(...days.monday)
  //                 template__.days.tuesday.push(...days.tuesday)
  //                 template__.days.wednesday.push(...days.wednesday)
  //                 template__.days.thursday.push(...days.thursday)
  //                 template__.days.saturday.push(...days.saturday)
  //                 template__.days.sunday.push(...days.sunday)
  //               }
  //             }
  //           }
  //         }
  //         else {
  //           templates.push({ week: i, weekCompleted: false, days })
  //         }

  //         days = {
  //           monday: [],
  //           tuesday: [],
  //           wednesday: [],
  //           thursday: [],
  //           // friday: [ ],
  //           saturday: [],
  //           sunday: [],
  //         }
  //       }
  //     }
  //     else if (queryBlock.exerciseType?.toLowerCase() === "random" || Number(queryBlock.exerciseCount) > 0) {
  //       // const exerciseCount = Number(queryBlock.exerciseCount) || 1
  //       // let exerciseList_ = await getAllGeneralExercises(exerciseCount)

  //       // for (let i = 1; i <= 12; i++) {
  //       //   if (exerciseList_.length > 1) {
  //       //     let days_ = Object.keys(days)
  //       //     for (let day__ of days_) {
  //       //       let arr = days[day__]

  //       //       if (problems_.length === 2) {
  //       //         if (arr.length === 2) {
  //       //           continue
  //       //         }

  //       //         days[day__].push(exerciseList_[0])
  //       //         if (!exerciseList_[1]) {
  //       //           days[day__].push(exerciseList_[0])
  //       //         }
  //       //         else {
  //       //           days[day__].push(exerciseList_[1])
  //       //         }
  //       //       }
  //       //       else {
  //       //         if (arr.length === exerciseList_.length) {
  //       //           continue
  //       //         }

  //       //         for (let n__ of exerciseList_) {
  //       //           days[day__].push(n__)
  //       //         }
  //       //       }

  //       //       exerciseList_.shift()

  //       //       if (exerciseList_.length > 0) {
  //       //         exerciseList_.shift()
  //       //       }
  //       //       if (exerciseList_.length === 0) {
  //       //         exerciseList_ = [...exerciseList_]
  //       //       }
  //       //     }
  //       //   }
  //       //   else {
  //       //     days.monday.push(...exerciseList_)
  //       //     days.tuesday.push(...exerciseList_)
  //       //     days.wednesday.push(...exerciseList_)
  //       //     days.thursday.push(...exerciseList_)
  //       //     days.saturday.push(...exerciseList_)
  //       //     days.sunday.push(...exerciseList_)
  //       //   }

  //       //   if (templates.find((u: any) => (u.week === i))) {
  //       //     for (let b__ of templates) {
  //       //       if (b__.week === i) {
  //       //         if (b__.days) {
  //       //           b__.days.monday.push(...days.monday)
  //       //           b__.days.tuesday.push(...days.tuesday)
  //       //           b__.days.wednesday.push(...days.wednesday)
  //       //           b__.days.thursday.push(...days.thursday)
  //       //           b__.days.saturday.push(...days.saturday)
  //       //           b__.days.sunday.push(...days.sunday)
  //       //         }
  //       //       }
  //       //     }
  //       //   }
  //       //   else {
  //       //     templates.push({ week: i, weekCompleted: false, days })
  //       //   }

  //       //   days = {
  //       //     monday: [],
  //       //     tuesday: [],
  //       //     wednesday: [],
  //       //     thursday: [],
  //       //     // friday: [ ],
  //       //     saturday: [],
  //       //     sunday: [],
  //       //   }
  //       // }
  //     }
  //     else {
  //       throw new Error("Failed to create an exercise program.")
  //     }
  //   }

  //   templates = removeTemplateDuplicates(templates)

  //   await Program.findOneAndUpdate({ userId }, { $set: { templates, userId } }, { upsert: true })
  // }
}


export default { createQuestionnaire, retrieveQuestionnaire, listQuestionnaires, updateQuestionnaire, deleteQuestionnaire, listAllQuestionnaires, retrieveQuestionnairesWithPaginate, retrieveQuestionnaireWithPaginateAggregate, generateProgramForUser, listAllQuestionnairesSortedByCreatedAt, retrieveNextQuestionnaire }
