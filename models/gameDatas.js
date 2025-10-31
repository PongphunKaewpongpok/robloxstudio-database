import fetch from "node-fetch";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import bcrypt from "bcrypt";
import dotenv from 'dotenv';
dotenv.config();

import globalDatas from "./globalDatas.js";



async function getRobloxUsername(userId) {
  const response = await fetch(`https://users.roblox.com/v1/users/${userId}`);
  const data = await response.json();
  return data.name;
}


const client = new DynamoDBClient({
  endpoint: process.env.DYNAMODB_ENDPOINT,
  region: process.env.AWS_REGION
});





import { CreateTableCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, PutCommand, QueryCommand, UpdateCommand, GetCommand } from "@aws-sdk/lib-dynamodb";



const ddbDocClient = DynamoDBDocumentClient.from(client);

async function createTable() {
  try {
    await ddbDocClient.send(new CreateTableCommand({
      TableName: "GameDatas",
      KeySchema: [
        { AttributeName: "game_name", KeyType: "HASH" },
        
      ],
      AttributeDefinitions: [
        { AttributeName: "game_name", AttributeType: "S" },
        { AttributeName: "token_id", AttributeType: "S" }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: "TokenIndex",
          KeySchema: [
            { AttributeName: "token_id", KeyType: "HASH" }
          ],
          Projection: {
            ProjectionType: "ALL"
          }
        }
      ],
      BillingMode: "PAY_PER_REQUEST"
    }));
    await waitUntilTableExists({ client, maxWaitTime: 20 }, { TableName: "GameDatas" });
    console.log("Table GameDatas created");
  } catch (err) {
    if (err.name === "ResourceInUseException") {
      console.log("Table GameDatas already exists");
      const data = await ddbDocClient.send(new ScanCommand({ TableName: "GameDatas" }));
      console.log(data.Items);
    } else {
      console.error(err);
    }
  }
}





let player_data = [
  { username: 'Konnnns', UserId: 2656501024, data: { "register": "registered", score: 2000, coins: 500, test: 1 } },
  { username: 'DARKMAGIC66548', UserId: 969345717, data: { "register": "registered", score: 1200, coins: 250, test: 1 } },
  { username: 'VeryLongPlayerNameExample', UserId: 1 , data: { "register": "registered", score: 999, coins: 1000, test: 1 } }
];

const logTypes = ['Lootbox', 'LevelUp', 'GetCoin'];

let allLogs = [
  { date: '2025-10-20', time: '12:00:05', type: 'Lootbox', username: 'ProtonEvent', playerId: 667225621, message: 'Player got 13 coins from lootbox' },
  { date: '2025-10-20', time: '12:05:10', type: 'LevelUp', username: 'ProtonEvent', playerId: 667225621, message: 'Player levelup from level 1 -> 2' },
  { date: '2025-10-21', time: '09:00:15', type: 'GetCoin', username: 'ProtonEvent', playerId: 667225621, message: 'Player collected 1 coin' },
];

function generateRandomDate(year) {
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    const hour = Math.floor(Math.random() * 24);
    const minute = Math.floor(Math.random() * 60);
    const second = Math.floor(Math.random() * 60);

    const formattedMonth = String(month).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const formattedHour = String(hour).padStart(2, '0');
    const formattedMinute = String(minute).padStart(2, '0');
    const formattedSecond = String(second).padStart(2, '0');

    return {
        date: `${year}-${formattedMonth}-${formattedDay}`,
        time: `${formattedHour}:${formattedMinute}:${formattedSecond}`
    };
}


let gacha_player_data = [
  { username: 'Tester1', UserId: 1234567, data: { "register": "registered" } },
  { username: 'Tester2', UserId: 1234568, data: { "register": "registered" } },
];

function createMockLogs(years, entriesPerYear) {
    const products = ['product_box', 'product_shield', 'product_skull', 'product_moon'];
    let logs = [];

    years.forEach(year => {
        for (let i = 0; i < entriesPerYear; i++) {
            const randomProduct = products[Math.floor(Math.random() * products.length)];
            const randomTesterIndex = Math.floor(Math.random() * 2);
            const randomDateTime = generateRandomDate(year);
            
            if (gacha_player_data[randomTesterIndex].data[randomProduct]) {
              gacha_player_data[randomTesterIndex].data[randomProduct] += 1
            } else {
              gacha_player_data[randomTesterIndex].data[randomProduct] = 1
            }
            

            logs.push({
                date: randomDateTime.date,
                time: randomDateTime.time,
                type: `${randomProduct}`,
                username: gacha_player_data[randomTesterIndex].username,
                playerId: gacha_player_data[randomTesterIndex].UserId,
                message: `Player purchased 1 ${randomProduct}.`
            });
        }
    });

    logs.sort((a, b) => {
        const dateA = new Date(a.date + ' ' + a.time);
        const dateB = new Date(b.date + ' ' + b.time); 
        return dateA - dateB;
    });

    return logs;
}

const chartallLogs = createMockLogs([2023, 2024], 20)





async function insertSampleData() {
  const password = "1234";
  const hashedPassword = await bcrypt.hash(password, 10);
  await ddbDocClient.send(new PutCommand({
    TableName: "GameDatas",
    Item: {
      game_name: "baseplate_dev",
      game_hashed_password: hashedPassword,
      game_id: 1,
      token_id: "X1cV5kP8nR3tQ6bW0yZ2mF9hL4sG7aD",
      player_data: player_data,
      all_logs: allLogs,
      all_log_types: logTypes,
    }
  }));

  await ddbDocClient.send(new PutCommand({
    TableName: "GameDatas",
    Item: {
      game_name: "baseplate_gacha",
      game_hashed_password: hashedPassword,
      game_id: 1,
      token_id: "8uC9yUr2tAUVi20iz7Ve6B7NC0OE1lgT",
      player_data: gacha_player_data,
      all_logs: chartallLogs,
      all_log_types: ['product_box', 'product_shield', 'product_skull', 'product_moon'],
    }
  }));
}



try {
  await client.send(new ScanCommand({ TableName: "GameDatas" }));
} catch (err) {
  if (err.name === "ResourceNotFoundException") {
    console.log("No Table Found. Creating table...");
    await createTable();
    await insertSampleData();
  } else {
    throw err;
  }
}

// -------------------------------
// Run setup
// -------------------------------
// (async () => {
//   await createTable();
// })();


const gameDatas = {
  createNewGame: async (gameName, hashedPassword, token_id) => {
    const updateResult = await ddbDocClient.send(new UpdateCommand({
        TableName: "GlobalDatas",
        Key: { data_type_name: "GLOBAL" },
        UpdateExpression: "ADD game_count :inc",
        ExpressionAttributeValues: { ":inc": 1 },
        ReturnValues: "UPDATED_NEW"
      }));

    const new_count = updateResult.Attributes.game_count;
    
    await ddbDocClient.send(new PutCommand({
      TableName: "GameDatas",
      Item: {
        game_name: gameName,
        game_hashed_password: hashedPassword,
        game_id: new_count,
        token_id: token_id,
        player_data: [],
        all_logs: [],
        all_log_types: []
      }
    }));
    
    return { success: true, game_id: new_count };
  },
  getGameByName: async (gameName) => {
    try {
      const params = {
        TableName: "GameDatas",
        KeyConditionExpression: "game_name = :name",
        ExpressionAttributeValues: {
          ":name": gameName
        }
      };

      const data = await ddbDocClient.send(new QueryCommand(params));
      return data.Items;
    } catch (err) {
      console.error("Error fetching game:", err);
    }
  },
  updateToken: async (game_name, token) => {
    try {
      const params = {
        TableName: "GameDatas",
        Key: { game_name },
        UpdateExpression: "SET token_id = :tok",
        ExpressionAttributeValues: { ":tok": token },
        ReturnValues: "UPDATED_NEW",
      };

      const result = await ddbDocClient.send(new UpdateCommand(params));
      return result;
    } catch (err) {
      console.error("Error updating token:", err);
      throw err;
    }
  },
  isTokenExists: async (token) => {
    try {
      const params = {
        TableName: "GameDatas",
        IndexName: "TokenIndex",
        KeyConditionExpression: "token_id = :tok",
        ExpressionAttributeValues: { ":tok": token },
      };

      const data = await ddbDocClient.send(new QueryCommand(params));
      return (data.Items && data.Items.length > 0);
    } catch (err) {
      console.error("Error checking token:", err);
      return false;
    }
  },
  saveLog: async (gameName, userId, type, message) => {
    try {
      const username = await getRobloxUsername(userId);

      const now = new Date();
      
      const dateOptions = { 
        timeZone: 'Asia/Bangkok', 
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      };
      
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0'); 
      const day = String(now.getDate()).padStart(2, '0');

      const localDate = `${year}-${month}-${day}`;
      const localTime = now.toLocaleTimeString('en-US', { hour12: false, timeZone: 'Asia/Bangkok' });

      const newLogEntry = {
        date: localDate,
        time: localTime, 
        type: type,
        username: username,
        playerId: userId,
        message: message
      };

      await ddbDocClient.send(new UpdateCommand({
        TableName: "GameDatas",
        Key: { 
            game_name: gameName
        },
        UpdateExpression: "SET all_logs = list_append(if_not_exists(all_logs, :empty_list), :new_log)",
        ExpressionAttributeValues: {
            ":new_log": [newLogEntry],
            ":empty_list": []
        }
      }));

      return { success: true };
    } catch (err) {
      console.error("Error saving log:", err);
      return { success: false, error: err.message };
    }
  },
  getPlayerDataFromToken: async (token) => {
    try {
      const params = {
        TableName: "GameDatas",
        IndexName: "TokenIndex",
        KeyConditionExpression: "token_id = :tok",
        ExpressionAttributeValues: { ":tok": token },
      };

      const data = await ddbDocClient.send(new QueryCommand(params));
      if (data.Items && data.Items.length > 0) {
        return data.Items[0].player_data;
      } else {
        return null;
      }
    } catch (err) {
      return null;
    }
  },
  getNameFromToken: async (token) => {
    try {
      const params = {
        TableName: "GameDatas",
        IndexName: "TokenIndex",
        KeyConditionExpression: "token_id = :tok",
        ExpressionAttributeValues: { ":tok": token },
      };

      const data = await ddbDocClient.send(new QueryCommand(params));
      if (data.Items && data.Items.length > 0) {
        return data.Items[0].game_name;
      } else {
        return null;
      }
    } catch (err) {
      return null;
    }
  },
  updatePlayerData: async (gameName, player_data) => {
    await ddbDocClient.send(new UpdateCommand({
      TableName: "GameDatas",
      Key: { game_name: gameName },
      UpdateExpression: "SET player_data = :pd",
      ExpressionAttributeValues: {
        ":pd": player_data
      }
    }));
  },
  createNewPlayer: async (gameName, user_id) => {
    const gameItems = await gameDatas.getGameByName(gameName); 
    const player_data = gameItems?.[0]?.player_data || [];
    
    const playerExists = player_data.some(p => p.UserId === user_id);
    
    if (playerExists) {
        return { success: true, message: "Player already exists." };
    }

    const username = await getRobloxUsername(user_id);
    const newPlayer = {
      UserId: user_id,
      username: username,
      data: {}
    };

    await ddbDocClient.send(new UpdateCommand({
      TableName: "GameDatas",
      Key: { game_name: gameName },
      UpdateExpression: "SET player_data = list_append(if_not_exists(player_data, :empty_list), :new_player)",
      ExpressionAttributeValues: {
        ":new_player": [newPlayer],
        ":empty_list": []
      }
    }));
  },
  updatePlayerByUserId: async (game_name, user_id, change_data, edit_type) => {
    const gameItems = await gameDatas.getGameByName(game_name); 
    const player_data = gameItems?.[0]?.player_data || [];

    const playerIndex = player_data.findIndex(p => p.UserId === user_id);
    if (playerIndex === -1) {
      throw new Error(`Player with UserId ${user_id} not found`);
    }

    const updateExpressions = [];
    const attrNames = {
      "#pdata": "data"
    };
    const attrValues = {};
    let i = 0;

    if (edit_type === "add") {
      attrValues[":zero"] = 0; 
    }

    for (const key in change_data) {
      const nameKey = `#k${i}`;
      const valueKey = `:v${i}`;
      attrNames[nameKey] = key;
      attrValues[valueKey] = change_data[key];

      if (edit_type === "add") {
        updateExpressions.push(
            `player_data[${playerIndex}].#pdata.${nameKey} = if_not_exists(player_data[${playerIndex}].#pdata.${nameKey}, :zero) + ${valueKey}`
        );
      } else {
        updateExpressions.push(`player_data[${playerIndex}].#pdata.${nameKey} = ${valueKey}`);
      }

      i++;
    }

    const UpdateExpression = "SET " + updateExpressions.join(", ");
    const Key = { game_name: game_name };

    await ddbDocClient.send(new UpdateCommand({
      TableName: "GameDatas",
      Key,
      UpdateExpression,
      ExpressionAttributeNames: attrNames,
      ExpressionAttributeValues: attrValues
    }));
  },
  getLogTypes: async (gameName) => {
        const params = {
            TableName: "GameDatas",
            Key: { game_name: gameName },
            ProjectionExpression: "all_log_types"
        };
        const data = await ddbDocClient.send(new GetCommand(params));
        return data.Item?.all_log_types || []; 
    },

    addLogType: async (gameName, newType) => {
        
        const currentTypes = await gameDatas.getLogTypes(gameName);
        
        if (currentTypes.includes(newType)) {
            console.log(`⚠️ Log Type "${newType}" already exists.`);
            return { success: false, message: "Type already exists." };
        }

        await ddbDocClient.send(new UpdateCommand({
            TableName: "GameDatas",
            Key: { game_name: gameName },
            UpdateExpression: "SET all_log_types = list_append(if_not_exists(all_log_types, :empty_list), :new_type)",
            ExpressionAttributeValues: {
                ":new_type": [newType],
                ":empty_list": []
            }
        }));
        return { success: true };
    },
    removeLogType: async (gameName, typeToRemove) => {
        const currentTypes = await gameDatas.getLogTypes(gameName);
        const indexToRemove = currentTypes.findIndex(t => t === typeToRemove);

        if (indexToRemove === -1) {
            console.log(`⚠️ Log Type "${typeToRemove}" not found.`);
            return { success: false, message: "Type not found." };
        }
        
        await ddbDocClient.send(new UpdateCommand({
            TableName: "GameDatas",
            Key: { game_name: gameName },
            UpdateExpression: `REMOVE all_log_types[${indexToRemove}]`,
        }));
        return { success: true };
    }
}

export default gameDatas