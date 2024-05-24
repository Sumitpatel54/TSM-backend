import HttpStatusCode from "http-status-codes"

import { Request, Response, NextFunction } from "../interfaces/express.interface"
import UserService from "../services/user.service"

const checkEmailExists = async (req: Request, res: Response, next: NextFunction) => {
    const emailToCheck = req.body.email
    const user = await UserService.findUser({ email: emailToCheck })

    if (user) {
        return res.status(HttpStatusCode.NOT_FOUND).send({
            status: false,
            message: `Admin with this Email already exists`
        })
    }

    return next()
}

export default checkEmailExists
