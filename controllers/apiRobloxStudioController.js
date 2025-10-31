import gameDatas from "../models/gameDatas.js";

const apiRobloxStudioController = {
  getPlayerData: async (req, res) => {
    const token_id = req.body.token_id;
    const item = await gameDatas.getPlayerDataFromToken(token_id);
    if (item != null) {
      res.json({ status: "success", data: item });
    } else {
      res.json({ status: "failed" });
    }
  },
  dataEditor: async (req, res) => {
    try {
      const { user_id, edit_type, change_data, token_id, type, message } = req.body;

      if (!user_id || !edit_type || !change_data || !token_id) {
        return res.status(400).json({ status: "failed", message: "Missing parameters" });
      }

      const game_name = await gameDatas.getNameFromToken(token_id);

      const player_data = await gameDatas.getPlayerDataFromToken(token_id);
      let playerIndex = player_data.findIndex(p => p.UserId === user_id);

      if (playerIndex === -1) {
        await gameDatas.createNewPlayer(game_name, user_id);
        const newData = await gameDatas.getPlayerDataFromToken(token_id);
        playerIndex = newData.findIndex(p => p.UserId === user_id);
      }

      await gameDatas.updatePlayerByUserId(game_name, user_id, change_data, edit_type);
      if (type !== "Register") {
        await gameDatas.saveLog(game_name, user_id, type, message)
      }

      res.json({ status: "success", message: "Player data updated successfully" });
    } catch (err) {
      console.error("dataEditor error:", err);
      res.status(500).json({ status: "failed", message: "Server error", error: err.message });
    }
  }
}

export default apiRobloxStudioController