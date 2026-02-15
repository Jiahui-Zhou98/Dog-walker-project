import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import MongoStore from "connect-mongo";
import requestsRouter from "./routes/requests.js";
import walkersRouter from "./routes/walkers.js";
import authRouter from "./routes/auth.js";

dotenv.config();

console.log("🐕 Initializing PawsitiveWalks backend...");
const PORT = process.env.PORT || 3000;

const app = express();

// Middleware
app.use(express.json());
app.use(express.static("frontend"));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || "mongodb://localhost:27017",
      dbName: "pawsitiveWalks",
    }),
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
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
