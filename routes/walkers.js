import express from "express";
import { ObjectId } from "mongodb";
import walkersDB from "../db/WalkersDB.js";

const router = express.Router();

/**
 * Helper to validate MongoDB ObjectId format
 */
function isValidObjectId(id) {
  return (
    ObjectId.isValid(id) && String(new ObjectId(id)) === id
  );
}

/**
 * GET /api/walkers - Fetch walkers with multi-filters and pagination
 */
router.get("/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = Math.min(parseInt(req.query.pageSize) || 12, 100);

  const query = {};

  // 1. My Posts Filter (Requires session userId)
  if (req.query.myPosts === "true") {
    if (req.session && req.session.userId) {
      query.userId = req.session.userId;
    } else {
      return res.json({ data: [], total: 0, page, pageSize, totalPages: 0 });
    }
  }

  // 2. Dog Sizes (Array search)
  if (req.query.size) {
    query.preferredDogSizes = req.query.size;
  }

  // 3. Location (Case-insensitive partial match)
  if (req.query.location) {
    query.serviceAreas = { $regex: req.query.location, $options: "i" };
  }

  // 4. Experience Years (GTE - Greater than or equal)
  if (req.query.experience) {
    query.experienceYears = { $gte: parseInt(req.query.experience) };
  }

  // 5. Time Slots (Matches values inside availability.times array)
  if (req.query.time) {
    query["availability.times"] = req.query.time;
  }

  // 6. Day Availability (Boolean flags inside availability object)
  if (req.query.availability) {
    if (req.query.availability === "weekdays") {
      query["availability.weekdays"] = true;
    } else if (req.query.availability === "weekends") {
      query["availability.weekends"] = true;
    }
  }

  try {
    const [walkers, totalCount] = await Promise.all([
      walkersDB.getWalkers({ query, pageSize, page }),
      walkersDB.countWalkers(query),
    ]);

    res.json({
      data: walkers,
      total: totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * GET /api/walkers/:id - Get single profile
 */
router.get("/:id", async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }
  try {
    const walker = await walkersDB.getWalkerById(req.params.id);
    if (!walker) return res.status(404).json({ error: "Walker not found" });
    res.json({ walker });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * POST /api/walkers - Create profile (Links to current user)
 */
router.post("/", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const walkerData = { 
      ...req.body, 
      userId: req.session.userId, 
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const newWalker = await walkersDB.createWalker(walkerData);
    res.status(201).json({ walker: newWalker });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * PUT /api/walkers/:id - Update profile (Owner only)
 */
router.put("/:id", async (req, res) => {
  if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: "Invalid ID" });

  try {
    const existing = await walkersDB.getWalkerById(req.params.id);
    if (!existing) return res.status(404).json({ error: "Walker not found" });

    if (existing.userId !== req.session.userId) {
      return res.status(403).json({ error: "Forbidden: Not your post" });
    }

    const updateData = { ...req.body, updatedAt: new Date() };
    await walkersDB.updateWalker(req.params.id, updateData);
    const updated = await walkersDB.getWalkerById(req.params.id);
    res.json({ walker: updated });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * DELETE /api/walkers/:id - Delete profile (Owner only)
 */
router.delete("/:id", async (req, res) => {
  if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: "Invalid ID" });

  try {
    const existing = await walkersDB.getWalkerById(req.params.id);
    if (!existing) return res.status(404).json({ error: "Walker not found" });

    if (existing.userId !== req.session.userId) {
      return res.status(403).json({ error: "Forbidden: Not your post" });
    }

    await walkersDB.deleteWalker(req.params.id);
    res.json({ message: "Walker deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;