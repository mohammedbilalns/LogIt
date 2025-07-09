import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";

import authRoutes from "./interfaces/http/routes/auth.routes";
import adminRoutes from "./interfaces/http/routes/admin.routes";
import articleRoutes from "./interfaces/http/routes/article.route";
import tagRoutes from "./interfaces/http/routes/tag.routes";
import userRoutes from "./interfaces/http/routes/user.route";
import logRoutes from "./interfaces/http/routes/log.routes";
import reportRoutes from "./interfaces/http/routes/report.routes";
import subscritionRoutes from "./interfaces/http/routes/subscription.route";
import connectionRoutes from "./interfaces/http/routes/connection.routes";
import { createChatRouter } from "./interfaces/http/routes/chat.routes";
import { errorMiddleware } from "./interfaces/http/middlewares/error.middleware";
import env from "./config/env";
import { initializeSocket } from "./config/socket";
import morgan from "morgan";
import { logger } from "./utils/logger";
import uploadRoutes from "./interfaces/http/routes/upload.routes";
import paymentRoutes from "./interfaces/http/routes/payment.routes";
import notificationRoutes from "./interfaces/http/routes/notification.routes";

const app = express();
const server = http.createServer(app);

export const socketConfig = initializeSocket(server);

const PORT = env.PORT;
const MONGODB_URI = env.MONGODB_URI;

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/user", userRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/chats", createChatRouter(socketConfig.io));
app.use("/api/subscription", subscritionRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use(errorMiddleware());

// Connect to DB
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    logger.green("DB_STATUS", "Connected to MongoDB");
    server.listen(PORT, () => {
      logger.green("SERVER", `Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    logger.red("DB_ERROR", "MongoDB connection error: " + error.message);
    process.exit(1);
  });
