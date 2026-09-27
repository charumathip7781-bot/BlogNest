const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const sanitize = require("./middleware/sanitize");
const requestLogger = require("./middleware/requestLogger");
const errorHandler = require("./middleware/errorHandler");
const { apiLimiter } = require("./middleware/rateLimiter");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const { postComments, moderation } = require("./routes/commentRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const tagRoutes = require("./routes/tagRoutes");
const mediaRoutes = require("./routes/mediaRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const aiRoutes = require("./routes/aiRoutes");
const searchRoutes = require("./routes/searchRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const origin =
  process.env.CORS_ORIGIN && process.env.CORS_ORIGIN !== "*"
    ? process.env.CORS_ORIGIN.split(",").map((item) => item.trim())
    : "*";

app.use(helmet());
app.use(cors({ origin }));
app.use(express.json({ limit: "1mb" }));
app.use(sanitize);
app.use(requestLogger);
app.use("/api", apiLimiter);

app.get("/api/health", (req, res) => {
  const db = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.json({ success: true, service: "BlogNest", db });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/blogs", postRoutes);
app.use("/api/posts/:postId/comments", postComments);
app.use("/api/comments", moderation);
app.use("/api/categories", categoryRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use(errorHandler);

module.exports = app;
