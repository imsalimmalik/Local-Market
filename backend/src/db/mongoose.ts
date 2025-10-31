import mongoose from "mongoose";
import env from "../config/env";

export const connectToDatabase = async () => {
  if (!env.mongoUri) {
    throw new Error("❌ MONGO_URI is missing from environment variables");
  }

  try {
    const conn = await mongoose.connect(env.mongoUri, { dbName: "platform" });
    console.log(`✅ MongoDB Connected: ${conn.connection.host} / db: ${conn.connection.name}`);
  } catch (error: any) {
    console.error(`🚨 MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};
