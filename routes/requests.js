// =============================================
// routes/requests.js - Routes for Dog Walking Requests
// Author: Jiahui Zhou
// Page: requests.html, post-request.html,
//       edit-request.html
// =============================================

import express from "express";
import { ObjectId } from "mongodb";
import requestsDB from "../db/RequestsDB.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// ========== Validation Helpers ==========

// Valid enum values for constrained fields
const VALID_SIZES = ["small", "medium", "large"];
const VALID_TIMES = ["morning", "afternoon", "evening"];
const VALID_TEMPERAMENTS = [
  "friendly",
  "shy",
  "energetic",
  "calm",
  "aggressive",
];
const VALID_FREQUENCIES = ["once", "daily", "weekly", "weekdays", "weekends"];
const VALID_STATUSES = ["open", "matched", "completed"];

// Check if a string is a valid MongoDB ObjectId
function isValidObjectId(id) {
  return (
    ObjectId.isValid(id) && String(ObjectId.createFromHexString(id)) === id
  );
}

// Validate and sanitize request data for Create and Update
function validateRequestData(body) {
  const errors = [];

  // --- Required fields ---
  if (
    !body.dogName ||
    typeof body.dogName !== "string" ||
    !body.dogName.trim()
  ) {
    errors.push("dogName is required and must be a non-empty string");
  }

  if (!body.breed || typeof body.breed !== "string" || !body.breed.trim()) {
    errors.push("breed is required and must be a non-empty string");
  }

  if (
    !body.ownerName ||
    typeof body.ownerName !== "string" ||
    !body.ownerName.trim()
  ) {
    errors.push("ownerName is required and must be a non-empty string");
  }

  if (
    !body.ownerEmail ||
    typeof body.ownerEmail !== "string" ||
    !body.ownerEmail.trim()
  ) {
    errors.push("ownerEmail is required and must be a non-empty string");
  }

  if (
    !body.location ||
    typeof body.location !== "string" ||
    !body.location.trim()
  ) {
    errors.push("location is required and must be a non-empty string");
  }

  // --- Type & range checks ---
  if (body.age !== undefined) {
    const age = Number(body.age);
    if (isNaN(age) || age < 0 || age > 30) {
      errors.push("age must be a number between 0 and 30");
    }
  }

  if (body.budget !== undefined) {
    const budget = Number(body.budget);
    if (isNaN(budget) || budget < 0) {
      errors.push("budget must be a non-negative number");
    }
  }

  if (body.duration !== undefined) {
    const duration = Number(body.duration);
    if (isNaN(duration) || duration < 10 || duration > 240) {
      errors.push("duration must be a number between 10 and 240 (minutes)");
    }
  }

  // --- Enum checks ---
  if (body.size && !VALID_SIZES.includes(body.size)) {
    errors.push(`size must be one of: ${VALID_SIZES.join(", ")}`);
  }

  if (body.preferredTime && !VALID_TIMES.includes(body.preferredTime)) {
    errors.push(`preferredTime must be one of: ${VALID_TIMES.join(", ")}`);
  }

  if (body.temperament && !VALID_TEMPERAMENTS.includes(body.temperament)) {
    errors.push(`temperament must be one of: ${VALID_TEMPERAMENTS.join(", ")}`);
  }

  if (body.frequency && !VALID_FREQUENCIES.includes(body.frequency)) {
    errors.push(`frequency must be one of: ${VALID_FREQUENCIES.join(", ")}`);
  }

  if (body.status && !VALID_STATUSES.includes(body.status)) {
    errors.push(`status must be one of: ${VALID_STATUSES.join(", ")}`);
  }

  // If there are errors, return them
  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // --- Build sanitized object (only allow known fields) ---
  const sanitized = {
    dogName: body.dogName.trim(),
    breed: body.breed.trim(),
    age: body.age !== undefined ? Number(body.age) : undefined,
    size: body.size || undefined,
    temperament: body.temperament || undefined,
    frequency: body.frequency || undefined,
    preferredTime: body.preferredTime || undefined,
    duration: body.duration !== undefined ? Number(body.duration) : undefined,
    startDate: body.startDate || undefined,
    budget: body.budget !== undefined ? Number(body.budget) : undefined,
    location: body.location.trim(),
    pickupLocation: body.pickupLocation
      ? body.pickupLocation.trim()
      : undefined,
    ownerName: body.ownerName.trim(),
    status: body.status || undefined,
    ownerPhone: body.ownerPhone ? body.ownerPhone.trim() : undefined,
    ownerEmail: body.ownerEmail.trim(),
    specialNeeds: body.specialNeeds ? body.specialNeeds.trim() : undefined,
    openToSocial: body.openToSocial === true || body.openToSocial === "true",
    socialNote: body.socialNote ? body.socialNote.trim() : undefined,
  };

  // Remove undefined fields so they don't get stored as null
  Object.keys(sanitized).forEach((key) => {
    if (sanitized[key] === undefined) {
      delete sanitized[key];
    }
  });

  return { valid: true, data: sanitized };
}

// ========== Routes ==========

// GET /api/requests - Get all dog walking requests
router.get("/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = Math.min(parseInt(req.query.pageSize) || 20, 100); // Cap at 100

  const query = {};
  if (req.query.createdBy) query.createdBy = req.query.createdBy;
  if (req.query.size) query.size = req.query.size;
  if (req.query.location) query.location = new RegExp(req.query.location, "i");
  if (req.query.preferredTime) query.preferredTime = req.query.preferredTime;
  if (req.query.status) query.status = req.query.status;
  if (req.query.openToSocial)
    query.openToSocial = req.query.openToSocial === "true";

  console.log("🐕 GET /api/requests", { page, pageSize, query });

  try {
    const requests = await requestsDB.getRequests({
      query,
      pageSize,
      page,
    });

    // Get total count for pagination
    const total = await requestsDB.countRequests(query);

    // Return in the format frontend expects
    res.json({
      data: requests,
      total: total,
      page: page,
      pageSize: pageSize,
    });
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ error: "Internal Server Error", data: [] });
  }
});

// GET /api/requests/:id - Get single request
router.get("/:id", async (req, res) => {
  // Validate ObjectId format before querying DB
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "Invalid request ID format" });
  }

  try {
    const request = await requestsDB.getRequestById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }
    res.json({ request });
  } catch (error) {
    console.error("Error fetching request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /api/requests - Create new request
router.post("/", requireAuth, async (req, res) => {
  // Validate request body
  const { valid, errors, data } = validateRequestData(req.body);
  if (!valid) {
    return res
      .status(400)
      .json({ error: "Validation failed", details: errors });
  }

  try {
    const newRequest = await requestsDB.createRequest({
      ...data,
      createdBy: req.session.userId,
    });
    res.status(201).json({ request: newRequest });
  } catch (error) {
    console.error("Error creating request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PUT /api/requests/:id - Update request
router.put("/:id", requireAuth, async (req, res) => {
  // Validate ObjectId format
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "Invalid request ID format" });
  }

  // Validate request body
  const { valid, errors, data } = validateRequestData(req.body);
  if (!valid) {
    return res
      .status(400)
      .json({ error: "Validation failed", details: errors });
  }

  try {
    // Check if the request exists before updating
    const existing = await requestsDB.getRequestById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: "Request not found" });
    }

    // Check if the request is owned by the user
    if (existing.createdBy !== req.session.userId) {
      return res
        .status(403)
        .json({ error: "You can only update your own requests." });
    }

    await requestsDB.updateRequest(req.params.id, data);
    const updatedRequest = await requestsDB.getRequestById(req.params.id);
    res.json({ request: updatedRequest });
  } catch (error) {
    console.error("Error updating request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE /api/requests/:id - Delete request
router.delete("/:id", requireAuth, async (req, res) => {
  // Validate ObjectId format
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "Invalid request ID format" });
  }

  try {
    // Check if the request exists before deleting
    const existing = await requestsDB.getRequestById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: "Request not found" });
    }

    // Check if the request is owned by the user
    if (existing.createdBy !== req.session.userId) {
      return res
        .status(403)
        .json({ error: "You can only delete your own requests." });
    }

    await requestsDB.deleteRequest(req.params.id);
    res.json({ message: "Request deleted successfully" });
  } catch (error) {
    console.error("Error deleting request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
