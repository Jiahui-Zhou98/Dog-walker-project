// =============================================
// routes/auth.js - Authentication routes
// =============================================

import express from "express";
import bcrypt from "bcrypt";
import usersDB from "../db/UsersDB.js";

const router = express.Router();

function sanitizeUser(user) {
  if (!user) return null;
  return {
    _id: user._id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password || !displayName) {
      return res
        .status(400)
        .json({ error: "email, password, displayName are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "password must be at least 8 characters" });
    }

    const existingUser = await usersDB.getUserByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await usersDB.createUser({
      email: normalizedEmail,
      displayName,
      passwordHash,
      role: "user",
    });

    req.session.userId = String(newUser._id);
    return res.status(201).json({ user: sanitizeUser(newUser) });
  } catch (err) {
    console.error("Error registering user:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await usersDB.getUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    req.session.userId = String(user._id);
    return res.json({ user: sanitizeUser(user) });
  } catch (err) {
    console.error("Error logging in:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /api/auth/logout
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error logging out:", err);
      return res.status(500).json({ error: "Failed to logout" });
    }
    return res.json({ message: "Logged out successfully" });
  });
});

// GET /api/auth/me
router.get("/me", async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await usersDB.getUserById(req.session.userId);
    if (!user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    return res.json({ user: sanitizeUser(user) });
  } catch (err) {
    console.error("Error fetching current user:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
