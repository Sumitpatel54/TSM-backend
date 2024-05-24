import { Request } from "express"

import { UserDocument } from "./user.interface"

interface RequestWithUser extends Request {
  user?: UserDocument
}

export default RequestWithUser
