import express from 'express'
import useDashboardRoutes from './dashboardRoutes.js'
import useApiRoutes from './apiRoutes.js'
import useApiRobloxStudioRoutes from './apiRobloxStudioRoutes.js'

const router = express.Router()
router.use(express.json())
router.use(express.urlencoded({ extended: true }));

useApiRoutes(router)
useDashboardRoutes(router)
useApiRobloxStudioRoutes(router)


export default router
