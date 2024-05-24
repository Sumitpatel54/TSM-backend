import { FilterQuery, UpdateQuery } from "mongoose"

import { ProgramDocument } from "../interfaces/program.interface"
import { UserDocument } from "../interfaces/user.interface"
import Program from "../models/program.model"
import User from "../models/user.model"

/**
 * Used to update program details by userId
 *
 * @param templateId
 * @param payload
 * @returns ProgramDocument | null
 */
const updateProgram = async (templateId: string, payload: UpdateQuery<ProgramDocument>): Promise<ProgramDocument | null> => {
  try {
    const program: any = await Program.findOneAndUpdate({ 'templates._id': templateId }, payload, { new: true })
    if (program) {
      return program
    }
    throw new Error(`Program details not found`)
  } catch (error: any) {
    throw new Error(error)
  }
}

/**
 * Used to update program details with $set param
 *
 * @param programObj
 * @param payload
 * @returns ExerciseDocument | null
 */
const updateProgramWithSet = async (programObj: any, payload: any) => {
  try {
    const program: any = await Program.findOneAndUpdate(programObj, payload, { new: true })
    if (program) {
      return program
    }
    throw new Error(`program details not found`)
  } catch (error: any) {
    throw new Error(error)
  }
}

/**
 * Used to find program by providing filter query
 * @param query
 * @returns ProgramDocument | null
 */
const retrieveProgram = async (query: FilterQuery<ProgramDocument>): Promise<ProgramDocument | null> => {
  try {
    const program: any = await Program.findOne(query).exec()
    console.log(program)
    if (program) {
      return program
    }
    else if (program === null) {
      return null
    }
    throw new Error(`Sorry some errors occurred while retriving Questionnaire`)
  } catch (error: any) {
    throw new Error(error.message)
  }
}

/**
 * Used to get user report by providing filter query
 * @param query
 * @returns UserDocument | null
 */
const retrieveReportBlock = async (query: FilterQuery<UserDocument>): Promise<any | null> => {
  try {
    const user: any = await User.findOne(query).exec()
    console.log(user)
    if (user) {
      let reportBlock = user.reportBlock
      if (!reportBlock || Object.keys(reportBlock).length === 0) {
        return null
      }
      let report = user.reportBlock

      if (Object.keys(report).length === 0) return {}
      else {
        let array = Object.values(report)

        let result = array.reduce((r:any, a:any) => {
          r[a.title] = r[a.title] || []
          r[a.title].push(a)
          return r
        }, Object.create(null))

        return result
      }
    }
    else if (user === null) {
      return null
    }
    throw new Error(`Sorry some errors occurred while retriving User report block`)
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export default { retrieveProgram, updateProgram, retrieveReportBlock, updateProgramWithSet }
