/* eslint-disable unused-imports/no-unused-imports */
import express from 'express'
import config from '../configurations/config'
import dailyTipController from '../controllers/dailyTip.controller'
import { verifyToken } from '../middleware/auth.middleware'
import { requireUserToLogin, routeAccess } from '../middleware/routeAccess.middleware'

const router = express.Router()
const onlyAdminPermission = config.routePermission.onlyAdmin

// Admin routes
router.post('/create', verifyToken as any, routeAccess(onlyAdminPermission) as any, dailyTipController.createDailyTip as any)
router.put('/:id', verifyToken as any, routeAccess(onlyAdminPermission) as any, dailyTipController.updateDailyTip as any)
router.delete('/:id', verifyToken as any, routeAccess(onlyAdminPermission) as any, dailyTipController.deleteDailyTip as any)

// Public routes
router.get('/list', dailyTipController.listDailyTips as any)

export default router
