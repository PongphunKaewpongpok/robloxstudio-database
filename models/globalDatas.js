import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import dotenv from 'dotenv';
dotenv.config();

const client = new DynamoDBClient({
  endpoint: process.env.DYNAMODB_ENDPOINT,
  region: process.env.AWS_REGION
});

import { CreateTableCommand, waitUntilTableExists } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = DynamoDBDocumentClient.from(client);

async function createTable() {
  try {
    await ddbDocClient.send(new CreateTableCommand({
      TableName: "GlobalDatas",
      KeySchema: [
        { AttributeName: "data_type_name", KeyType: "HASH" }
    ],
      AttributeDefinitions: [
        { AttributeName: "data_type_name", AttributeType: "S" }
    ],
      BillingMode: "PAY_PER_REQUEST"
    }));
    
    await waitUntilTableExists({ client, maxWaitTime: 20 }, { TableName: "GlobalDatas" });
    console.log("Table GlobalDatas created");
  } catch (err) {
    if (err.name === "ResourceInUseException") {
      console.log("Table GlobalDatas already exists");
      const data = await ddbDocClient.send(new ScanCommand({ TableName: "GlobalDatas" }));
      console.log(data.Items);
    } else {
      console.error(err);
    }
  }
}

async function insertSampleData() {
  await ddbDocClient.send(new PutCommand({
    TableName: "GlobalDatas",
    Item: {
      data_type_name: "GLOBAL",
      datas: {
        game_count: 1
      }
    }
  }));
}


try {
  await client.send(new ScanCommand({ TableName: "GlobalDatas" }));
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


const globalDatas = {
  getGameCount: async () => {
    try {
      const params = {
        TableName: "GlobalDatas",
        Key: {
          data_type_name: "GLOBAL"
        }
      };

      const result = await ddbDocClient.send(new GetCommand(params));
      if (result.Item && result.Item.datas && typeof result.Item.datas.game_count === "number") {
        return result.Item.datas.game_count;
      } else {
        return 0;
      }
    } catch (err) {
      console.error("Error fetching game_count:", err);
      throw err;
    }
  },
  updateGameCount: async (newCount) => {
    try {
      const params = {
        TableName: "GlobalDatas",
        Key: { data_type_name: "GLOBAL" },
        UpdateExpression: "SET datas.game_count = :count",
        ExpressionAttributeValues: {
          ":count": newCount
        },
        ReturnValues: "UPDATED_NEW"
      };

      const result = await ddbDocClient.send(new UpdateCommand(params));
      return result.Attributes;
    } catch (err) {
      console.error("Error updating game_count:", err);
      throw err;
    }
  },
  getPlayers: async (req, res) => {
    try {
        res.json({ players: player_data });
    } catch (err) {
        console.error("Error sending player data:", err);
        res.status(500).json({ error: "Failed to get players" });
    }
  },
  generateToken: async (req, res) => {
    try {
      let token;
      do {
        token = generateToken(32);
      } while (existingTokens.has(token));

      existingTokens.add(token);
      console.log("Generated token:", token);

      res.json({ status: "success", token });
    } catch (err) {
      console.error("Error generating token:", err);
      res.status(500).json({ status: "error", message: "Internal server error" });
    }
  },
}

export default globalDatas




