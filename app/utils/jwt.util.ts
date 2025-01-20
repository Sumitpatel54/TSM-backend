/* eslint-disable no-multi-spaces */
import fs from "fs"
import path from "path"
import jwt from "jsonwebtoken"

/**
 * JWT private key and public key
 */
const privateKey = fs.readFileSync(path.join(__dirname, "../../private.key"), {
    encoding: 'utf8',
    flag: 'r'
})

// For RS256, we need both private and public keys
const publicKey = fs.readFileSync(path.join(__dirname, "../../public.key"), {
    encoding: 'utf8',
    flag: 'r'
})

/**
 * Used to decode the JWT string
 */
export const decode = (token: string) => {
    try {
        const decoded = jwt.verify(token.toString(), publicKey, { algorithms: ['RS256'] })
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
 * Used to sign the given payload into JWT string
 */
export const sign = (object: Object, options?: jwt.SignOptions | undefined) => {
    return jwt.sign(object, privateKey, {
        ...options,
        algorithm: 'RS256'  // Explicitly specify the algorithm
    })
}
