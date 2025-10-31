import session from "express-session";
import dotenv from 'dotenv';
dotenv.config();

import authModel from "../models/authModel.js";
import gameDatas from "../models/gameDatas.js"


function generateToken(length = 32) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < length; i++) token += chars.charAt(Math.floor(Math.random() * chars.length));
  return token;
}



const apiController = {
  getPlayers: async (req, res) => {
    try {
      const game_name = req.session?.user?.username; 
      if (!game_name) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const items = await gameDatas.getGameByName(game_name);

      if (items && items.length > 0) {
        const player_data = items[0].player_data;
        res.status(200).json({ success: true, players: player_data});
      } else {
        res.status(404).json({ success: false, message: "Game not found" });
      }

    } catch (err) {
      console.error("Error sending player data:", err);
        res.status(500).json({ error: "Failed to get players" });
    }
  },
  generateToken: async (req, res) => {
    try {
      const game_name = req.session?.user?.username;
      if (!game_name) return res.status(401).json({ status: "error", message: "Unauthorized" });

      let token;
      let exists;
      do {
        token = generateToken(32);
        exists = await gameDatas.isTokenExists(token);
      } while (exists);

      await gameDatas.updateToken(game_name, token);

      res.json({ status: "success", token });
    } catch (err) {
      console.error("Error generating token:", err);
      res.status(500).json({ status: "error", message: "Internal server error" });
    }
  },
  getToken: async (req, res) => {
    try {
      const game_name = req.session?.user?.username; 
      if (!game_name) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const items = await gameDatas.getGameByName(game_name);

      if (items && items.length > 0) {
        const token_id = items[0].token_id;
        res.status(200).json({ success: true, token_id: token_id });
      } else {
        res.status(404).json({ success: false, message: "Game not found" });
      }

    } catch (err) {
      console.error("Error in getToken:", err);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  },
  login: async (req, res) => {
    const { username, password } = req.body;
    const result = await authModel.login(username, password);

    if (result.success) {
      // เก็บข้อมูลผู้ใช้ใน session
      req.session.user = { username: result.user.game_name };

      res.status(200).json({
        status: "success",
        user: result.user
      });
    } else {
      res.status(401).json({ status: "error", message: result.message });
    }
  },
  register: async (req, res) => {
    console.log("📥 Register request body:", req.body);

    const { username, password } = req.body;
    const result = await authModel.register(username, password);

    console.log("📤 Register result:", result);

    if (result.success) {
      res.json({ status: "success", user: result.user });
    } else {
      res.status(400).json({ status: "error", message: result.message });
    }
  },
  logout: (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ message: "Logout failed" });
        res.clearCookie("connect.sid");
        res.json({ status: "success" });
    });
  },
  updatePlayerData: async (req, res) => {
    const { playerIndex, updatedData } = req.body;
    const gameName = req.session?.user?.username;
    if (!gameName) return res.status(401).json({ success: false, message: "Unauthorized" });

    const items = await gameDatas.getGameByName(gameName);
    if (!items || items.length === 0) return res.status(404).json({ success: false, message: "Game not found" });

    const game = items[0];

    if (playerIndex === 'everyone') {
      game.player_data.forEach(player => {
        Object.keys(updatedData).forEach(key => {
          if (updatedData[key] === null) delete player.data[key];
          else player.data[key] = updatedData[key];
        });
      });
    } else {
      Object.keys(updatedData).forEach(key => {
        if (updatedData[key] === null) delete game.player_data[playerIndex].data[key];
        else game.player_data[playerIndex].data[key] = updatedData[key];
      });
    }

    await gameDatas.updatePlayerData(gameName, game.player_data);

    res.json({ success: true, message: "Player data updated successfully!" });
  },
  getLogTypes: async (req, res) => {
    const game_name = req.session?.user?.username; 
    try {
        const types = await gameDatas.getLogTypes(game_name);
        res.json({ success: true, types });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
  },
  addLogType: async (req, res) => {
    const game_name = req.session?.user?.username; 
    const { newType } = req.body;
    try {
        const result = await gameDatas.addLogType(game_name, newType);
        if (result.success) {
            res.json({ success: true });
        } else {
            res.status(409).json({ success: false, message: result.message });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
  },
  removeLogType: async (req, res) => {
    const game_name = req.session?.user?.username; 
    const { typeToRemove } = req.body;
    try {
        const result = await gameDatas.removeLogType(game_name, typeToRemove);
        if (result.success) {
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, message: result.message });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default apiController