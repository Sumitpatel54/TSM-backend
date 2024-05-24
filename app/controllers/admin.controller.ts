import { Request, Response} from 'express'
import HttpStatusCode from "http-status-codes"
import mongoose from "mongoose"

// import { Request, Response } from "../interfaces/express.interface"
import UserService from "../services/user.service"



const apiGetAdmin = async (req: Request, res: Response) => {
    try {
        const adminId: any = req.params.id?.toString()
        const findAdminResponse = await UserService.findUser({ _id: new mongoose.Types.ObjectId(adminId) })
        if(findAdminResponse !== null) {
            return res.status(200).send({
                status: true,
                data: findAdminResponse,
                message: "Admin Record Fetched"
            })
        }
        return res.status(404).send({
            status: false,
            message: "No record found"
        })

    } catch (error: any) {
        return res.status(404).send({
            status: false,
            message: error.message
        })
    }
}

const apiCreateAdmin = async (req: Request, res: Response) => {
    try {
        const payload: any = req.body ? req.body : undefined
        if (payload === undefined) {
            return res.status(HttpStatusCode.BAD_REQUEST).send({
                status: false,
                message: "Invalid Payload"
            })
        }

        payload.role = "admin"

        const createAdminResponse = await UserService.createUser(payload)
        return res.status(200).send({
            status: true,
            data: createAdminResponse,
            message: "Admin Record Created"
        })
    } catch (error: any) {
        return res.status(404).send({
            status: false,
            message: error.message
        })
    }
}

const apiUpdateAdmin = async (req: Request, res: Response) => {
    try {
        const payload: any = req.body
        const adminId: any = req.params.id

        const updateAdminResponse = await UserService.updateUser(adminId, payload)
        return res.status(200).send({
            status: true,
            data: updateAdminResponse,
            message: "Admin Record Updated"
        })
    } catch (error: any) {
        return res.status(404).send({
            status: false,
            message: error.message
        })
    }
}

const apiDeleteAdmin = async (req: Request, res: Response) => {
    try {
        const adminId: any = req.params.id
        const deleteAdminResponse = await UserService.deleteUser(adminId)
        return res.status(200).send({
            status: true,
            data: deleteAdminResponse,
            message: "Admin Record Deleted"
        })
    } catch (error: any) {
        return res.status(404).send({
            status: false,
            message: error.message
        })
    }
}

const adminAccessOnly = async (_req: Request, _res: Response) => {
   console.log("adminAccessOnly")
}

const userAccessOnly = async (_req: Request, _res: Response) => {
    console.log("userAccessOnly")
 }

export default {
    apiGetAdmin,
    apiCreateAdmin,
    apiUpdateAdmin,
    apiDeleteAdmin,
    adminAccessOnly,
    userAccessOnly
}
