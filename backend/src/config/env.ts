import dotenv from "dotenv";

dotenv.config();

const env = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  mongoUri: process.env.MONGO_URI || "",
};

if (!env.mongoUri) {
  console.warn("⚠️  MONGO_URI is not set in your .env file");
}

export default env;
