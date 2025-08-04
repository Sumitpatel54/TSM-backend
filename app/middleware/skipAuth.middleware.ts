import { Request, Response, NextFunction } from "express"

/**
 * Middleware to skip authentication for specific routes
 * This is useful for routes that need to be accessed without authentication
 * like payment webhooks and registration after payment
 */
const skipAuth = (req: Request, res: Response, next: NextFunction) => {
    try {
        // Skip authentication for this route
        console.log("Skipping auth for route:", req.path)
        next()
    } catch (error) {
        console.error("Error in skipAuth middleware:", error)
        next()
    }
}

export { skipAuth }
