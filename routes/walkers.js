import express from "express";
import { ObjectId } from "mongodb";
import walkersDB from "../db/WalkersDB.js";
import { requireAuth } from "../middleware/auth.js"; // Ensure this middleware exists

const router = express.Router();

// ========== Validation Helpers ==========

/**
 * Check if a string is a valid MongoDB ObjectId
 */
function isValidObjectId(id) {
  try {
    return ObjectId.isValid(id) && String(new ObjectId(id)) === id;
  } catch {
    return false;
  }
}

/**
 * Validate and sanitize walker data for Create and Update
 */
function validateWalkerData(body) {
  const errors = [];

  if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
    errors.push("Name is required.");
  }

  if (body.experienceYears !== undefined) {
    const exp = Number(body.experienceYears);
    if (isNaN(exp) || exp < 0)
      errors.push("Experience must be a non-negative number.");
  }

  if (body.hourlyRate !== undefined) {
    const rate = Number(body.hourlyRate);
    if (isNaN(rate) || rate < 0)
      errors.push("Hourly rate must be a non-negative number.");
  }

  if (errors.length > 0) return { valid: false, errors };

  // Sanitize data structure to match DB expectations
  const sanitized = {
    name: body.name.trim(),
    email: body.email?.trim().toLowerCase(),
    phone: body.phone?.trim(),
    experienceYears: Number(body.experienceYears) || 0,
    hourlyRate: Number(body.hourlyRate) || 0,
    serviceAreas: Array.isArray(body.serviceAreas) ? body.serviceAreas : [],
    preferredDogSizes: Array.isArray(body.preferredDogSizes)
      ? body.preferredDogSizes
      : [],
    availability: {
      weekdays:
        body.availability?.weekdays === true ||
        body.availability?.weekdays === "true",
      weekends:
        body.availability?.weekends === true ||
        body.availability?.weekends === "true",
      times: Array.isArray(body.availability?.times)
        ? body.availability?.times
        : [],
    },
    bio: body.bio ? body.bio.trim() : "",
  };

  return { valid: true, data: sanitized };
}

// ========== Routes ==========

/**
 * GET /api/walkers - Fetch walkers with multi-filters and pagination
 */
router.get("/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = Math.min(parseInt(req.query.pageSize) || 12, 100);

  const query = {};

  // 1. My Posts Filter
  if (req.query.myPosts === "true" && req.session.userId) {
    query.userId = req.session.userId;
  }

  // 2. Dog Sizes (Matches filterSize)
  if (req.query.size) {
    query.preferredDogSizes = req.query.size;
  }

  // 3. Location (Matches filterLocation - Partial match)
  if (req.query.location) {
    query.serviceAreas = { $regex: req.query.location, $options: "i" };
  }

  // 4. Experience Years (Matches filterExperience)
  if (req.query.experience) {
    query.experienceYears = { $gte: parseInt(req.query.experience) };
  }

  // 5. Preferred Time (Matches filterTime)
  if (req.query.time) {
    query["availability.times"] = req.query.time;
  }

  // 6. Day Availability (Matches filterAvailability)
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
    console.error("GET Walkers Error:", error);
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
  } catch {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * POST /api/walkers - Create profile
 */
router.post("/", requireAuth, async (req, res) => {
  const { valid, errors, data } = validateWalkerData(req.body);
  if (!valid)
    return res
      .status(400)
      .json({ error: "Validation failed", details: errors });

  try {
    const walkerData = {
      ...data,
      userId: req.session.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newWalker = await walkersDB.createWalker(walkerData);
    res.status(201).json({ walker: newWalker });
  } catch (error) {
    console.error("POST Walker Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * PUT /api/walkers/:id - Update profile (Owner only)
 */
router.put("/:id", requireAuth, async (req, res) => {
  if (!isValidObjectId(req.params.id))
    return res.status(400).json({ error: "Invalid ID" });

  const { valid, errors, data } = validateWalkerData(req.body);
  if (!valid)
    return res
      .status(400)
      .json({ error: "Validation failed", details: errors });

  try {
    const existing = await walkersDB.getWalkerById(req.params.id);
    if (!existing) return res.status(404).json({ error: "Walker not found" });

    // CRITICAL: Ownership Check (String conversion is essential)
    if (
      !existing.userId ||
      String(existing.userId) !== String(req.session.userId)
    ) {
      return res.status(403).json({ error: "Forbidden: Not your post" });
    }

    const updateData = { ...data, updatedAt: new Date() };
    await walkersDB.updateWalker(req.params.id, updateData);
    const updated = await walkersDB.getWalkerById(req.params.id);
    res.json({ walker: updated });
  } catch (error) {
    console.error("PUT Walker Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * DELETE /api/walkers/:id - Delete profile (Owner only)
 */
router.delete("/:id", requireAuth, async (req, res) => {
  if (!isValidObjectId(req.params.id))
    return res.status(400).json({ error: "Invalid ID" });

  try {
    const existing = await walkersDB.getWalkerById(req.params.id);
    if (!existing) return res.status(404).json({ error: "Walker not found" });

    // CRITICAL: Ownership Check
    if (
      !existing.userId ||
      String(existing.userId) !== String(req.session.userId)
    ) {
      return res.status(403).json({ error: "Forbidden: Not your post" });
    }

    await walkersDB.deleteWalker(req.params.id);
    res.json({ message: "Walker deleted successfully" });
  } catch (error) {
    console.error("DELETE Walker Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
