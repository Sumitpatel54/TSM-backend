import { Request, Response} from 'express'
import Stripe from "stripe"

import StatsService from "../services/stats.service"
import CommonFunctions from "../utilities/common"

const stripe = new Stripe(process.env.STRIPE_API_SECRET || "", { apiVersion: '2022-08-01' })

/**
 * @summary - Get total user count
 * @param req
 * @param res
 * @returns
 */
 const apiGetUserInfo = async (req: Request, res: Response) => {
    try {
        const totalUserCount = await StatsService.retrieveTotalUserCount({ isDeleted: false })
        const totalPaidUserCount = await StatsService.retrievePaidUserCount("userId")

        return res.status(200).send({
            status: true,
            data: { totalUserCount, totalPaidUserCount },
            message: "Record Fetched"
        })
    } catch (error: any) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
}

/**
 * @summary - Fetch total payouts for a period of time
 * @param req
 * @param res
 * @returns
 */
const apiGetRevenueInfo = async (req: Request, res: Response) => {
    try {
        const startTime: any = req.query.startTime
        const endTime: any = req.query.endTime

        CommonFunctions.validateRequestForEmptyValues({ startTime, endTime })

        const payouts: any = await stripe.payouts.list({
            created: { gte: Number(startTime), lte: Number(endTime) } as any,
            limit: 100 // Maximum limit (10 is default)
        })
        if (!Array.isArray(payouts.data) || payouts.data.length === 0) {
            return res.status(200).send({
                status: true,
                data: 0,
                message: "Fetched"
            })
        }

        const amountTotal = payouts.data.reduce((a: any, b: any) => ({ amount: a.amount + b.amount })).amount

        return res.status(200).send({
            status: true,
            data: amountTotal,
            message: "Fetched"
        })
    } catch (error: any) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
}

export default { apiGetUserInfo, apiGetRevenueInfo }
