import * as bcrypt from "bcrypt"
import HttpStatusCode from "http-status-codes"

import { Request, Response, NextFunction } from "../interfaces/express.interface"
import UserService from "../services/user.service"

const comparePassword = async (req: Request, res: Response, next: NextFunction) => {
    const emailToCheck = req.body.email
    const passwordToCheck = req.body.password
    const user: any = await UserService.findUser({ email: emailToCheck })

    bcrypt.compare(passwordToCheck, user.password, function (err, result) {
        if (result === false) {
            return res.status(HttpStatusCode.BAD_REQUEST).send({
                status: false,
                message: `Incorrect email or password.`
            })
        } else {
            return next()
        }
    })

}

export default comparePassword
