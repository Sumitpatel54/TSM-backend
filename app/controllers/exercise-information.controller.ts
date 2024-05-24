import HttpStatusCode from "http-status-codes"

import { Request, Response } from "../interfaces/express.interface"
import NutritionInformationService from "../services/exercise-information.service"

const apiRetrieveExerciseInformation = async (req: Request, res: Response) => {
    try {
        const retrieveNutritionInformationResponse: any = await NutritionInformationService.listNutritionInformtion({})
        if (Array.isArray(retrieveNutritionInformationResponse)) {
            return res.status(200).send({
                status: true,
                data: retrieveNutritionInformationResponse[0] || {},
                message: "Nutrition information Record Fetched"
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

const apiCreateExerciseInformation = async (req: Request, res: Response) => {
    try {
        const payload: any = req.body ? req.body : undefined
        if (payload === undefined || !payload.information) {
            return res.status(HttpStatusCode.BAD_REQUEST).send({
                status: false,
                message: "Invalid Payload"
            })
        }
        const createExerciseResponse = await NutritionInformationService.createNutritionInformation({ information: payload.information })
        return res.status(200).send({
            status: true,
            data: createExerciseResponse,
            message: "Nutrition Information Record Created"
        })
    } catch (error: any) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
}

const apiDeleteExerciseInformation = async (req: Request, res: Response) => {
    try {
        const nutritionInformationId: any = req.params.id
        const deleteResponse = await NutritionInformationService.deleteNutritionInformation(nutritionInformationId)
        return res.status(200).send({
            status: true,
            data: deleteResponse,
            message: "Nutrition Information Record Deleted"
        })
    } catch (error: any) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
}


const apiUpdateExerciseInformation = async (req: Request, res: Response) => {
    try {
        const information: any = req.body.information
        const id: any = req.params.id

        const updateResponse = await NutritionInformationService.updateNutritionInformation(id, { information })
        return res.status(200).send({
            status: true,
            data: updateResponse,
            message: "Nutrition Information Record Updated"
        })
    } catch (error: any) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
}

export default { apiRetrieveExerciseInformation, apiCreateExerciseInformation, apiDeleteExerciseInformation, apiUpdateExerciseInformation }
