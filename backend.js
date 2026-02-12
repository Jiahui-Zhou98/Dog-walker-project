import express from "express";
import dotenv from "dotenv";
import requestsRouter from "./routes/requests.js";
// TODO: Yi-Peng - uncomment when walkers router is ready
// import walkersRouter from "./routes/walkers.js";

dotenv.config();

console.log("🐕 Initializing PawsitiveWalks backend...");
const PORT = process.env.PORT || 3000;

const app = express();

// Middleware
app.use(express.json());
app.use(express.static("frontend"));

// API Routes
app.use("/api/requests", requestsRouter);
// TODO: Yi-Peng - uncomment when walkers router is ready
// app.use("/api/walkers", walkersRouter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "PawsitiveWalks API is running" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Frontend: http://localhost:${PORT}`);
  console.log(`API: http://localhost:${PORT}/api`);
});
