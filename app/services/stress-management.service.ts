import { Document, FilterQuery } from "mongoose"

import { StressManagementDetailDocument } from "../interfaces/stress-management-detail.interface"
import { StressManagementDocument } from "../interfaces/stress-management.interface"
import StressManagementDetail from "../models/stress-management-detail.model"
import StressManagement from "../models/stress-management.model"

/**
 * Used to find stress management by providing filter query
 * @param query
 * @returns StressManagementDocument | null
 */
const listStressManagement = async (query: FilterQuery<StressManagementDocument>): Promise<StressManagementDocument | undefined> => {
  try {
    const stressManagement: any = await StressManagement.find(query ? query : {})
    if (stressManagement) {
      return stressManagement
    }
    throw new Error(`Sorry some errors occurred while retriving Stress Management`)
  } catch (error: any) {
    throw new Error(error.message)
  }
}

/**
 * Used to find stress management by providing filter query
 * @param query
 * @returns StressManagementDocument | null
 */
const retrieveStressManagement = async (query: FilterQuery<StressManagementDocument>): Promise<StressManagementDocument | undefined> => {
  try {
    const stressManagement: any = await StressManagement.findOne(query).exec()
    if (stressManagement) {
      return stressManagement
    }
    throw new Error(`Sorry some errors occurred while retriving stress management`)
  } catch (error: any) {
    throw new Error(error.message)
  }
}

/**
 * Used to create Stress Management record in DB
 *
 * @param payload
 * @returns Object | null
 */
const createStressManagement = async (payload: Document<StressManagementDocument>) => {
  try {
    const stressManagement = await StressManagement.create(payload)
    if (stressManagement) {
      return stressManagement
    }
    throw new Error(`Sorry some errors occurred while creating stress management`)
  } catch (error: any) {
    throw new Error(error)
  }
}

/**
 * Used to create a stress management detail record in DB
 *
 * @param payload
 * @returns Object | null
 */
const createStressManagementDetail = async (payload: Document<StressManagementDetailDocument>) => {
  try {
    const result = await StressManagementDetail.create(payload)
    if (result) {
      return result
    }
    throw new Error(`Sorry some errors occurred while creating stress management detail`)
  } catch (error: any) {
    throw new Error(error)
  }
}

/**
 * Used to update stress management detail
 *
 * @param id
 * @param payload
 * @returns StressManagementDetailDocument | null
 */
const updateStressManagementDetail = async (id: string, payload: any): Promise<StressManagementDetailDocument | null> => {
  try {
    const result: any = await StressManagementDetail.findByIdAndUpdate(id, payload, { new: true })
    if (result) {
      return result
    }
    throw new Error(`stress management detail not found`)
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
const findAndUpdateManyStressManagementDetail = async (id: string, payload: any) => {
  try {
    const result: any = await StressManagementDetail.updateMany({ categoryId: id }, payload)
    if (result) {
      return result
    }
    throw new Error(`stress management detail not found`)
  } catch (error: any) {
    throw new Error(error)
  }
}

/**
 * Used to find a single stress management detail
 * @param query
 * @returns StressManagementDetailDocument | null
 */
const retrieveStressManagementDetail = async (query: FilterQuery<StressManagementDetailDocument>): Promise<StressManagementDetailDocument | undefined> => {
  try {
    const result: any = await StressManagementDetail.findOne(query).exec()
    if (result) {
      return result
    }
    throw new Error(`Sorry some errors occurred while retriving stress management detail`)
  } catch (error: any) {
    throw new Error(error.message)
  }
}

/**
 * Used to delete stress management detail
 * @param id
 * @returns
 */
const deleteStressManagementDetail = async (id: string) => {
  try {
    const result = await StressManagementDetail.findByIdAndDelete(id)
    return result
  } catch (error: any) {
    throw new Error(error)
  }
}

const retrieveSMDWithPaginate = async (query: FilterQuery<StressManagementDetailDocument>, options: any): Promise<StressManagementDetailDocument | null> => {
  try {
    const result: any = await StressManagementDetail.paginate(query, options)
    if (result) {
      return result
    }
    throw new Error(`Sorry some errors occurred while retriving stress management detail`)
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
const retrieveStressManagementWithPaginateAggregate = async (query: any, options: any): Promise<any | null> => {
  try {
    const myAggregate = StressManagementDetail.aggregate(query)
    // @ts-expect-error
      const response: any = await StressManagementDetail.aggregatePaginate(myAggregate, options)
      if (response) {
          return response
      }
      throw new Error(`Sorry some errors occurred while retriving stress managment`)
  } catch (error: any) {
      throw new Error(error.message)
  }
}

/**
 * Used to update stress management details by userId
 *
 * @param id
 * @param payload
 * @returns StressManagementDocument | null
 */
const updateStressManagement = async (id: string, payload: any): Promise<StressManagementDocument | null> => {
  try {
    const stressManagement: any = await StressManagement.findByIdAndUpdate(id, payload, { new: true })
    if (stressManagement) {
      return stressManagement
    }
    throw new Error(`Stress management details not found`)
  } catch (error: any) {
    throw new Error(error)
  }
}

/**
 * Used to delete stress management record from DB
 * @param id
 * @returns
 */
const deleteStressManagement = async (id: string) => {
  try {
    const stressManagement = await StressManagement.findByIdAndDelete(id)
    return stressManagement
  } catch (error: any) {
    throw new Error(error)
  }
}

export default { listStressManagement, retrieveStressManagementWithPaginateAggregate, retrieveStressManagement, createStressManagement, updateStressManagement, deleteStressManagement, createStressManagementDetail, updateStressManagementDetail, retrieveStressManagementDetail, retrieveSMDWithPaginate, deleteStressManagementDetail, findAndUpdateManyStressManagementDetail }
