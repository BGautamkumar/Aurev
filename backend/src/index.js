import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { generalLimiter, authLimiter, messageLimiter } from "./middleware/rateLimit.middleware.js";
import { isPublicRoute } from "./middleware/publicRoute.middleware.js";

import path from "path";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import friendshipRoutes from "./routes/friendship.route.js";
import conversationRoutes from "./routes/conversation.route.js";
import roomRoutes from "./routes/room.route.js";
import echoRoutes from "./routes/echo.route.js";
import { healthCheck } from "./controllers/health.controller.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5002;
const __dirname = path.resolve();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Identify public routes before rate limiting
app.use(isPublicRoute);

// Apply general rate limiting to all API routes
app.use("/api", generalLimiter);

// Apply stricter rate limiting to auth routes
app.use("/api/auth", authLimiter);
app.use("/api/messages", messageLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/friends", friendshipRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/echo", echoRoutes);
app.get("/health", healthCheck);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
});
