import jwt from "jsonwebtoken"

import { Request, Response, NextFunction } from "../interfaces/express.interface"

const routeAccess = function (requiredRoles: any) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            let authData: any

            if (req.user !== undefined) {
                authData = req.user
            }
            //test case is right now only added for to check if user has the admin role, in future add more roles in user and modify if else conditions here : Sharnam J
            if (authData.role !== undefined) {
                if (requiredRoles.includes("admin") && authData.role === "admin") {
                    next()
                } else {
                    return res.status(401).json({ status: false, message: "Un-authorized Admin Access" })
                }
            } else {
                return res.status(401).json({ status: false, message: "Roles Not Present" })
            }
        } catch (error) {
            return next(error)
        }
    }
}

const requireUserToLogin = (req: any, res: any, next: any) => {
    // const token = req.header('auth-token')
    const header = req.headers["authorization"]
    const bearer = header.split(" ")
    const token = bearer[1]
    if (!token) return res.status(401).json({ msg: 'Login again' })
    try {
        const payload: any = jwt.verify(token, process.env.JWT_SECRET || "")
        if (payload.role !== "patient") {
            throw new Error("")
        }
        req.user = payload
        next()
    } catch (error) {
        return res.status(401).json({ status: false })
        // return res.status(401).json({ status: false, message: "Invalid Token!" })
    }
}

export { requireUserToLogin, routeAccess }
