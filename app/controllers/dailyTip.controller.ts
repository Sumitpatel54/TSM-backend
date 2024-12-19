import { Request, Response } from 'express'
import HttpStatusCode from 'http-status-codes'
import DailyTip from '../models/dailytip.model'
import constants from '../utilities/directoryPath'
import commonUtilitie from '../utilities/common'

const createDailyTip = async (req: Request, res: Response) => {
    try {
        let payload: any = req.body
        if (!payload) {
            return res.status(HttpStatusCode.BAD_REQUEST).send({
                status: false,
                message: "Invalid Payload",
            })
        }

        const files: any[] = Object.values(req.files || {})
        if (files.length > 0) {
            const imageUrlsArray = await Promise.all(files.map(file =>
                commonUtilitie.getUploadURLWithDir(file, constants.DAILY_TIPS_IMAGES)
            ))
            payload.imageUrl = imageUrlsArray.flat()
        }

        const dailyTip = new DailyTip(payload)
        const result = await dailyTip.save()

        return res.status(HttpStatusCode.CREATED).send({
            status: true,
            data: result,
            message: "Daily tip created successfully",
        })
    } catch (error: any) {
        return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
            status: false,
            message: error.message,
        })
    }
}

const updateDailyTip = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        let payload: any = req.body

        // Handle image deletion
        if (payload.deleteImage === 'true') {
            payload.imageUrl = [] // Clear the imageUrl array
        } else {
            // Only update imageUrl if new files are uploaded
            const files: any[] = Object.values(req.files || {})
            if (files.length > 0) {
                const imageUrlsArray = await Promise.all(files.map(file =>
                    commonUtilitie.getUploadURLWithDir(file, constants.DAILY_TIPS_IMAGES)
                ))
                payload.imageUrl = imageUrlsArray.flat()
            }
        }

        const updatedTip = await DailyTip.findByIdAndUpdate(
            id,
            payload,
            { new: true }
        )

        if (!updatedTip) {
            return res.status(HttpStatusCode.NOT_FOUND).send({
                status: false,
                message: "Daily tip not found",
            })
        }

        return res.status(HttpStatusCode.OK).send({
            status: true,
            data: updatedTip,
            message: "Daily tip updated successfully",
        })
    } catch (error: any) {
        return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
            status: false,
            message: error.message,
        })
    }
}

const deleteDailyTip = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const deletedTip = await DailyTip.findByIdAndDelete(id)

        if (!deletedTip) {
            return res.status(HttpStatusCode.NOT_FOUND).send({
                status: false,
                message: "Daily tip not found",
            })
        }

        return res.status(HttpStatusCode.OK).send({
            status: true,
            message: "Daily tip deleted successfully",
        })
    } catch (error: any) {
        return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
            status: false,
            message: error.message,
        })
    }
}

const listDailyTips = async (req: Request, res: Response) => {
    try {
        const dailyTips = await DailyTip.find().sort({ createdAt: -1 })

        console.log('dailyTips ==',dailyTips)

        return res.status(HttpStatusCode.OK).send({
            status: true,
            data: dailyTips,
            message: "Daily tips retrieved successfully",
        })
    } catch (error: any) {
        return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
            status: false,
            message: error.message,
        })
    }
}

export default {
    createDailyTip,
    updateDailyTip,
    deleteDailyTip,
    listDailyTips,
}
