// =============================================
// db/UsersDB.js - Database methods for Users
// Shared by: auth.js, auth middleware
// =============================================

import { ObjectId } from "mongodb";
import { connect } from "./connection.js";

const usersDB = {
  async getUserByEmail(email) {
    const { client, collection } = connect("users");
    try {
      const normalizedEmail = String(email).trim().toLowerCase();
      return await collection.findOne({ email: normalizedEmail });
    } catch (err) {
      console.error("Error fetching user by email:", err);
      throw err;
    } finally {
      await client.close();
    }
  },

  async getUserById(id) {
    const { client, collection } = connect("users");
    try {
      return await collection.findOne({ _id: new ObjectId(id) });
    } catch (err) {
      console.error("Error fetching user by id:", err);
      throw err;
    } finally {
      await client.close();
    }
  },

  async createUser({ email, displayName, passwordHash, role = "user" }) {
    const { client, collection } = connect("users");
    try {
      const now = new Date();
      const newUser = {
        email: String(email).trim().toLowerCase(),
        displayName: String(displayName).trim(),
        passwordHash,
        role,
        createdAt: now,
        updatedAt: now,
      };

      const result = await collection.insertOne(newUser);
      return { ...newUser, _id: result.insertedId };
    } catch (err) {
      console.error("Error creating user:", err);
      throw err;
    } finally {
      await client.close();
    }
  },
};

export default usersDB;
