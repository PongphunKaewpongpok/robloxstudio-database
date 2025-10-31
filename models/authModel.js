import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import bcrypt from "bcrypt";
import dotenv from 'dotenv';
dotenv.config();

import gameDatas from "./gameDatas.js";

const client = new DynamoDBClient({
  endpoint: process.env.DYNAMODB_ENDPOINT,
  region: process.env.AWS_REGION
});




function generateToken(length = 32) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < length; i++) token += chars.charAt(Math.floor(Math.random() * chars.length));
  return token;
}


import { CreateTableCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, PutCommand, QueryCommand, GetCommand } from "@aws-sdk/lib-dynamodb";



const ddbDocClient = DynamoDBDocumentClient.from(client);

const authModel = {
  /**
   * ตรวจสอบ login
   * @param {string} username game_name
   * @param {string} password รหัสผ่านที่ผู้ใช้กรอก
   * @returns {boolean|object} true + user data ถ้าผ่าน, false ถ้าไม่ผ่าน
   */
  login: async (username, password) => {
    try {
      const params = {
        TableName: "GameDatas",
        KeyConditionExpression: "game_name = :name",
        ExpressionAttributeValues: {
          ":name": username
        }
      };

      const data = await ddbDocClient.send(new QueryCommand(params));
      if (!data.Items || data.Items.length === 0) {
        return { success: false, message: "Invalid username or password" };
      }

      const user = data.Items[0];

      const validPassword = await bcrypt.compare(password, user.game_hashed_password);
      if (!validPassword) {
        return { success: false, message: "Invalid username or password" };
      }

      return { success: true, user };
    } catch (err) {
      console.error("Login error:", err);
      return { success: false, message: "Internal error" };
    }
  },
  register: async (username, password) => {
    try {
      const existing = await ddbDocClient.send(new GetCommand({
        TableName: "GameDatas",
        Key: { game_name: username },
      }));

      if (existing.Item) {
        return { success: false, message: "Username already exists" };
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      gameDatas.createNewGame(username, hashedPassword, generateToken())

      return {
        success: true,
        user: { username },
        message: "Registered successfully"
      };
    } catch (err) {
      console.error("Register error:", err);
      return { success: false, message: "Server error" };
    }
  },
  getUserById: async (username) => {
    try {
      const data = await ddbDocClient.send(new GetCommand({
        TableName: "GameDatas",
        Key: { game_name: username }
      }));
      return data.Item || null;
    } catch (err) {
      console.error("getUserById error:", err);
      return null;
    }
  }
};

export default authModel;