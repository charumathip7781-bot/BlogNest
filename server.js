require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const logger = require("./utils/logger");

const PORT = Number(process.env.PORT) || 5050;

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  logger.error({ message: "JWT_SECRET must be set to at least 32 characters" });
  process.exit(1);
}

connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      logger.info({ message: `BlogNest server listening on port ${PORT}` });
    });
    server.on("error", (error) => {
      const message =
        error.code === "EADDRINUSE"
          ? `Port ${PORT} is already in use`
          : error.message;
      logger.error({ message });
      process.exit(1);
    });
  })
  .catch((error) => {
    logger.error({ message: error.message });
    process.exit(1);
  });
