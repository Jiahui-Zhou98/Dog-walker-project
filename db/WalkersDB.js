// =============================================
// db/WalkersDB.js - Database methods for Walkers
// Author: Yi-Peng Chiang
// Collection: walkers
// =============================================
import { ObjectId } from "mongodb";
import { connect } from "./connection.js";

const WalkersDB = {
  countWalkers: async (query = {}) => {
    const { client, collection } = await connect("walkers");
    try {
      return await collection.countDocuments(query);
    } finally {
      await client.close();
    }
  },

  getWalkers: async ({ query = {}, pageSize = 20, page = 1 } = {}) => {
    const { client, collection } = await connect("walkers");
    try {
      const walkers = await collection
        .find(query)
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .toArray();
      return walkers;
    } finally {
      await client.close();
    }
  },

  getWalkerById: async (id) => {
    const { client, collection } = await connect("walkers");
    try {
      const walker = await collection.findOne({ _id: new ObjectId(id) });
      return walker;
    } finally {
      await client.close();
    }
  },

  createWalker: async (data) => {
    const { client, collection } = await connect("walkers");
    try {
      const walker = { ...data, createdAt: new Date(), updatedAt: new Date() };
      const result = await collection.insertOne(walker);
      return { ...walker, _id: result.insertedId };
    } finally {
      await client.close();
    }
  },

  updateWalker: async (id, data) => {
    const { client, collection } = await connect("walkers");
    try {
      const updateData = { ...data, updatedAt: new Date() };
      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData },
      );
      return updateData;
    } finally {
      await client.close();
    }
  },

  deleteWalker: async (id) => {
    const { client, collection } = await connect("walkers");
    try {
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      return result;
    } finally {
      await client.close();
    }
  },
};

export default WalkersDB;
