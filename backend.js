import express from "express";
import dotenv from "dotenv";
import crypto from "node:crypto";
import session from "express-session";
import MongoStore from "connect-mongo";
import requestsRouter from "./routes/requests.js";
import walkersRouter from "./routes/walkers.js";
import authRouter from "./routes/auth.js";

dotenv.config();

console.log("🐕 Initializing PawsitiveWalks backend...");
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const SESSION_SECRET = process.env.SESSION_SECRET;

const app = express();
const isProduction = process.env.NODE_ENV === "production";

if (isProduction) {
  // Required so secure session cookies work correctly behind managed proxies.
  app.set("trust proxy", 1);
}

if (isProduction && !process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is required in production.");
}

if (isProduction && !SESSION_SECRET) {
  throw new Error("SESSION_SECRET is required in production.");
}

const sessionSecret =
  SESSION_SECRET || crypto.randomBytes(32).toString("hex");

if (!SESSION_SECRET) {
  console.warn(
    "SESSION_SECRET is not set. Using a temporary secret for local development only.",
  );
}

// Middleware
app.use(express.json());
app.use(express.static("frontend"));
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: MONGODB_URI,
      dbName: "pawsitiveWalks",
    }),
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  }),
);

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/requests", requestsRouter);
app.use("/api/walkers", walkersRouter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "PawsitiveWalks API is running" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Frontend: http://localhost:${PORT}`);
  console.log(`API: http://localhost:${PORT}/api`);
});
