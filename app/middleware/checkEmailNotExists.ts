import HttpStatusCode from "http-status-codes"

import { Request, Response, NextFunction } from "../interfaces/express.interface"
import UserService from "../services/user.service"

const checkEmailNotExists = async (req: Request, res: Response, next: NextFunction) => {
    const emailToCheck = req.body.email
    const user = await UserService.findUser({ email: emailToCheck })

    if (!user) {
        return res.status(HttpStatusCode.BAD_REQUEST).send({
            status: false,
            message: `Incorrect email or password.`
        })
    }

    return next()
}

export default checkEmailNotExists
