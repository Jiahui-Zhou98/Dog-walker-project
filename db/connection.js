// =============================================
// db/connection.js - Shared MongoDB connection helper
// Shared by: RequestsDB.js, WalkersDB.js
// =============================================

import { MongoClient } from "mongodb";

const DB_NAME = "pawsitiveWalks";

export function connect(collectionName) {
  const URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
  console.log("Connecting to MongoDB...");
  const client = new MongoClient(URI);
  const collection = client.db(DB_NAME).collection(collectionName);
  return { client, collection };
}
