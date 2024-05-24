import fs from "fs"
import path from "path"

import jwt from "jsonwebtoken"

/**
 * JWT private key
 */
const privateKey = fs.readFileSync(path.join(__dirname, "../../private.key"), "utf8")
const publicKey : any = process.env.JWT_SECRET

/**
 * Used to signed the given payload into JWT sting
 *
 * @param object object
 * @param options
 * @returns String
 */
export const decode = (token: string) => {
    try {
        /**
         * Decode the token to get encoded details
         */
        const decoded = jwt.verify(token.toString(), publicKey)

        return {
            valid: true,
            expired: false,
            decoded
        }
    } catch (error: any) {
        return {
            valid: false,
            expired: error.message === "JWT expired",
            decoded: null
        }
    }
}

/**
 * Used to decode the JWT string
 *
 * @param token string
 * @returns Object
 */
export const sign = (object: Object, options?: jwt.SignOptions | undefined) => {
    return jwt.sign(object, privateKey, options)
}
