import apiRobloxStudioController from "../controllers/apiRobloxStudioController.js"
import authMiddleware from "../middlewares/authMiddleware.js"

const useApiRobloxStudioRoutes = async (router) => {
  router.post("/roblox-studio-api/getPlayerData", authMiddleware.robloxStudioMiddleware(), apiRobloxStudioController.getPlayerData);
  router.post("/roblox-studio-api/dataEditor", authMiddleware.robloxStudioMiddleware(), apiRobloxStudioController.dataEditor);
}

export default useApiRobloxStudioRoutes