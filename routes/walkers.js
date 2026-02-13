// =============================================
// routes/walkers.js - Routes for Walkers
// Author: Yi-Peng
// Page: walkers.html
// =============================================

import express from "express";
import { ObjectId } from "mongodb";
import walkersDB from "../db/WalkersDB.js";

const router = express.Router();

function isValidObjectId(id) {
  return ObjectId.isValid(id) && String(new ObjectId(id)) === id;
}

// GET /api/walkers - Get walkers (pagination)
router.get("/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = Math.min(parseInt(req.query.pageSize) || 20, 100);

  const query = {};

  console.log("🐾 GET /api/walkers", { page, pageSize, query });

  try {
    const walkers = await walkersDB.getWalkers({ query, pageSize, page });

    res.json({
      data: walkers,
      total: walkers.length,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("Error fetching walkers:", error);
    res.status(500).json({ error: "Internal Server Error", data: [] });
  }
});

// GET /api/walkers/:id - Get single walker
router.get("/:id", async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "Invalid walker ID format" });
  }

  try {
    const walker = await walkersDB.getWalkerById(req.params.id);
    if (!walker) {
      return res.status(404).json({ error: "Walker not found" });
    }
    res.json({ walker });
  } catch (error) {
    console.error("Error fetching walker:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /api/walkers - Create walker
router.post("/", async (req, res) => {
  try {
    const newWalker = await walkersDB.createWalker(req.body);
    res.status(201).json({ walker: newWalker });
  } catch (error) {
    console.error("Error creating walker:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PUT /api/walkers/:id - Update walker
router.put("/:id", async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "Invalid walker ID format" });
  }

  try {
    const existing = await walkersDB.getWalkerById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: "Walker not found" });
    }

    await walkersDB.updateWalker(req.params.id, req.body);
    const updated = await walkersDB.getWalkerById(req.params.id);

    res.json({ walker: updated });
  } catch (error) {
    console.error("Error updating walker:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE /api/walkers/:id - Delete walker
router.delete("/:id", async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "Invalid walker ID format" });
  }

  try {
    const existing = await walkersDB.getWalkerById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: "Walker not found" });
    }

    await walkersDB.deleteWalker(req.params.id);
    res.json({ message: "Walker deleted successfully" });
  } catch (error) {
    console.error("Error deleting walker:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
