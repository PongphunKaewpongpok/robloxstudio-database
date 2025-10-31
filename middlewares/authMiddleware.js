import authModel from "../models/authModel.js"
import gameDatas from "../models/gameDatas.js"

import dotenv from "dotenv";
dotenv.config();

const authMiddleware = () => {
  return async (req, res, next) => {
    try {
      if (req.session.user && req.session.user.username) {
        const user = await authModel.getUserById(req.session.user.username);
        if (user) {
          req.user = user;
          return next();
        }
      }
      return res.redirect("/login");
    } catch (err) {
      console.error("Auth error:", err);
      return res.redirect("/login");
    }
  };
};

const redirectIfLoggedIn = () => {
  return async (req, res, next) => {
    try {
      if (req.session.user) {
        return res.redirect("/dashboard/player"); 
      } else {
        next();
      }
    } catch (err) {
      next();
    }
  };
};

const robloxStudioMiddleware = () => {
  return async (req, res, next) => {
    try {
      const token_id = req.body.token_id;
      const status = await gameDatas.isTokenExists(token_id);

      if (status) {
        next();
      } else {
        return res.json({ status: "failed" });
      }
    } catch (err) {
      return res.json({ status: "failed" });
    }
  };
};

export default { authMiddleware, redirectIfLoggedIn, robloxStudioMiddleware };
