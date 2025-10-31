import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

import gameDatas from "../models/gameDatas.js"
import globalDatas from "../models/globalDatas.js"


const logTypes = ['Gacha', 'warning', 'error'];








const dashboardController = {
  dashboard_player: (req, res) => {
    res.render('services/player', { title: "Player Editor", page: "player" });
  },
  dashboard_settings: (req, res) => {
    res.render('services/settings', { title: "Settings", page: "settings" });
  },
  dashboard_logs: async (req, res) => {
        const { startDate, endDate, logType, playerId } = req.query;

        const game_data = (await gameDatas.getGameByName(req.session.user.username))[0];
        let logs = game_data.all_logs;
        const logTypes = game_data.all_log_types

        if (startDate) logs = logs.filter(log => new Date(log.date) >= new Date(startDate));
        if (endDate) logs = logs.filter(log => new Date(log.date) <= new Date(endDate));
        if (logType) logs = logs.filter(log => log.type === logType);
        if (playerId) logs = logs.filter(log => String(log.playerId) === String(playerId));

        logs = logs.sort((a, b) => {
            if (a.date === b.date) {
                return b.time.localeCompare(a.time);
            }
            return b.date.localeCompare(a.date);
        });
        
        res.render('services/logs', { 
            title: "Logs", 
            page: "logs", 
            logs,
            logTypes,
            logType,
            startDate,
            endDate,
            playerId
        });
    },
  dashboard_analytics: async (req, res) => {
        const game_data = (await gameDatas.getGameByName(req.session.user.username))[0];
        const player_data = game_data.player_data
        const logTypes = game_data.all_log_types
        const logs = game_data.all_logs;
        
        res.render('services/analytics', {
            title: 'Analytics',
            page: 'analytics',
            player_data,
            logTypes,
            logs
        });
    }
}

export default dashboardController