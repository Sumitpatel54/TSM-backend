/* eslint-disable no-trailing-spaces */
/* eslint-disable semi */
import { Request, Response } from "express"
import UserService from "../services/user.service"
import questionnaireService from "../services/questionnaire.service"

/**
 * @summary - Fetch a user
 * @param req
 * @param res
 * @returns
 */
const updateUserBMIData = async (user: any) => {
    // set bmi
    let updateUserBMIPayload = {}
    if (!user.bmiData) {
        let findBmiQue: any = await questionnaireService.retrieveQuestionnaire({
            title: { $regex: "height" },
        })
        let userBMI: any = await UserService.findUserWithQuestionnaireAnswers(
            { email: user?.email },
            findBmiQue?._id
        )
        Object.assign(updateUserBMIPayload, {
            bmiData: JSON.parse(
                userBMI?.questionnaireAnswers[findBmiQue?._id]?.answer
            )
        })
    }
    if (!user.bmiAfter30Data && user.questionnaireAnswersAfter30Days) {
        let findBmiAgter30DaysQue: any =
            await questionnaireService.retrieveQuestionnaire({
                title: { $regex: "height" },
            })
        let userBMIAgter30Days: any =
            await UserService.findUserWithQuestionnaireAnswers(
                { email: user?.email },
                findBmiAgter30DaysQue?._id
            )
        Object.assign(updateUserBMIPayload, {
            bmiAfter30Data: JSON.parse(
                userBMIAgter30Days?.questionnaireAnswers[findBmiAgter30DaysQue?._id]?.answer
            ),
        })
    }
    if (!user.bmiAfter60Data && user.questionnaireAnswersAfter60Days) {
        let findBmiAgter60DaysQue: any =
            await questionnaireService.retrieveQuestionnaire({
                title: { $regex: "height" },
            })
        let userBMIAgter60Days: any =
            await UserService.findUserWithQuestionnaireAnswers(
                { email: user?.email },
                findBmiAgter60DaysQue?._id
            )

        Object.assign(updateUserBMIPayload, {
            bmiAfter60Data: JSON.parse(
                userBMIAgter60Days?.questionnaireAnswers[findBmiAgter60DaysQue?._id]?.answer
            ),
        })
    }
    await UserService.updateUser(user._id, updateUserBMIPayload)
}

const apiGetUser = async (req: Request, res: Response) => {
    let statusCode = 500

    try {
        const userId: any = req.params.id
        // get user
        const user: any = await UserService.findUser({ _id: userId })
        
         // Update user BMI data if available
         try {
            await updateUserBMIData(user);
        } catch (error: any) {
            console.warn("Failed to update user BMI data:", error.message);
            // Continue without BMI data
        }

        return res.status(200).send({
            status: true,
            data: user,
            message: "Successfully retreived.",
        })
    } catch (error: any) {
        return res.status(statusCode).send({
            status: false,
            message: error.message,
        })
    }
}

/**
 * @summary - Update a user
 * @param req
 * @param res
 * @returns
 */
const apiUpdateUser = async (req: Request, res: Response) => {
    let statusCode = 500

    try {
        const userId: any = req.params.id
        const { firstName, lastName, age } = req.body

        let body: any = {}

        if (firstName) body.firstName = firstName
        if (lastName) body.lastName = lastName
        if (age) body.age = age

        // update user
        const user = await UserService.updateUser(userId, body)

        return res.status(200).send({
            status: true,
            data: user,
            message: "Successfully updated user.",
        })
    } catch (error: any) {
        return res.status(statusCode).send({
            status: false,
            message: error.message,
        })
    }
}

export default { apiGetUser, apiUpdateUser }
