import { UserDocument } from "../../interfaces/user.interface"

declare global {
  namespace Express {
    interface User extends UserDocument {
      id?: string
      role?: string
    }

    interface Request {
      user?: UserDocument
    }
  }
  interface Error {
    status?: number
    message?: string
  }
}
