import { Request as ExpressRequest, Response as ExpressResponse, NextFunction as ExpressNextFunction } from "express"

import { UserDocument } from "./user.interface"

export interface NextFunction extends ExpressNextFunction {}

export interface Request extends ExpressRequest {
  user?: UserDocument
}

export interface Response extends ExpressResponse {
  user?: UserDocument
}
