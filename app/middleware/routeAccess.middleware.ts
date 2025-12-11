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
    try {
        // Check for token in various places
        let token;

        // Check authorization header
        const header = req.headers["authorization"];
        if (header) {
            const parts = header.split(" ");
            if (parts.length === 2 && parts[0] === "Bearer") {
                token = parts[1];
            }
        }

        // If no token in header, check auth-token header
        if (!token) {
            token = req.header('auth-token');
        }

        // If still no token, check cookies
        if (!token && req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({ status: false, message: 'Authentication token missing' });
        }

        const payload: any = jwt.verify(token, process.env.JWT_SECRET || "");
        console.log("DEBUG ROLE:", payload.role, "| HELE PAYLOAD:", JSON.stringify(payload));
        if (payload.role !== "patient" && payload.role !== "admin") {
            return res.status(403).json({ status: false, message: 'Unauthorized role' });
        }

        req.user = payload;
        next();
    } catch (error) {
        console.error("Auth error:", error);
        return res.status(401).json({ status: false, message: "Invalid or expired token" });
    }
}

export { requireUserToLogin, routeAccess }
