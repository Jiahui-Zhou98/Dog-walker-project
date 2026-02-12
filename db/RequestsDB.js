// =============================================
// db/RequestsDB.js - Database methods for Requests
// Author: Jiahui Zhou
// Collection: requests
// =============================================

import { ObjectId } from "mongodb";
import { connect } from "./connection.js";

const requestsDB = {
  getRequests: async ({ query = {}, pageSize = 20, page = 1 } = {}) => {
    const { client, collection } = connect("requests");
    try {
      const requests = await collection
        .find(query)
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .sort({ createdAt: -1 })
        .toArray();
      console.log("📋 Fetched requests:", requests.length);
      return requests;
    } catch (err) {
      console.error("Error fetching requests:", err);
      throw err;
    } finally {
      await client.close();
    }
  },

  getRequestById: async (id) => {
    const { client, collection } = connect("requests");
    try {
      const request = await collection.findOne({ _id: new ObjectId(id) });
      return request;
    } catch (err) {
      console.error("Error fetching request by ID:", err);
      throw err;
    } finally {
      await client.close();
    }
  },

  countRequests: async (query = {}) => {
    const { client, collection } = connect("requests");
    try {
      const count = await collection.countDocuments(query);
      return count;
    } catch (err) {
      console.error("Error counting requests:", err);
      throw err;
    } finally {
      await client.close();
    }
  },

  createRequest: async (data) => {
    const { client, collection } = connect("requests");
    try {
      const newRequest = {
        ...data,
        status: "open",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await collection.insertOne(newRequest);
      console.log("✅ Created new request");
      return { ...newRequest, _id: result.insertedId };
    } catch (err) {
      console.error("Error creating request:", err);
      throw err;
    } finally {
      await client.close();
    }
  },

  updateRequest: async (id, data) => {
    const { client, collection } = connect("requests");
    try {
      const updateData = { ...data, updatedAt: new Date() };
      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData },
      );
      console.log("✏️ Updated request");
      return updateData;
    } catch (err) {
      console.error("Error updating request:", err);
      throw err;
    } finally {
      await client.close();
    }
  },

  deleteRequest: async (id) => {
    const { client, collection } = connect("requests");
    try {
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      console.log("🗑️ Deleted request");
      return result;
    } catch (err) {
      console.error("Error deleting request:", err);
      throw err;
    } finally {
      await client.close();
    }
  },
};

export default requestsDB;
