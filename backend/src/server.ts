import express from "express";
import cors from "cors";
import env from "./config/env";
import { connectToDatabase } from "./db/mongoose";
import shopRoutes from "./routes/shopRoutes";
import offerRoutes from "./routes/offerRoutes";
import Offer from "./models/offer";

                      async function start() {
                        const app = express();

                        // Middleware
                        app.use(cors({ origin: env.corsOrigin }));
                        app.use(express.json());
                        app.use("/uploads", express.static("uploads"));
                        app.use("/api/shops", shopRoutes);
                        app.use("/api/offers", offerRoutes);

                        // Routes
                        app.get("/", (_req, res) => {
                          res.status(200).send("API is running");
                        });

                        app.get("/health", (_req, res) => {
                          res.status(200).json({ status: "ok", env: env.nodeEnv });
                        });

                        // Connect to MongoDB
                        try {
                          await connectToDatabase();
                          console.log("Connected to MongoDB");
                        } catch (err) {
                          console.error("Failed to connect to MongoDB:", err);
                          process.exit(1);
                        }

                        // Schedule automatic deletion of expired offers (runs every hour)
                        const deleteExpiredOffers = async () => {
                          try {
                            const now = new Date();
                            const result = await Offer.deleteMany({ endDate: { $lt: now } });
                            if (result.deletedCount > 0) {
                              console.log(`🗑️  Deleted ${result.deletedCount} expired offers`);
                            }
                          } catch (error) {
                            console.error("Error deleting expired offers:", error);
                          }
                        };

                        // Run immediately on startup and then every hour
                        deleteExpiredOffers();
                        setInterval(deleteExpiredOffers, 60 * 60 * 1000); // Every hour

                        // Start the server
                        app.listen(env.port, () => {
                          console.log(`🚀 Server running at http://localhost:${env.port}`);
                        });
                      }

                      // Start the app
                      start();
