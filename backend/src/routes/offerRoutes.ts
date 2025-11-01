import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import Offer from "../models/offer";
import Shop from "../models/shop";
import { logger } from "../utils/logger";
import { createSlug } from "../utils/slug";

const router = express.Router();

// Configure multer storage (backend/uploads)
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, "");
    cb(null, `offer-${base}-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

// POST /api/offers - create a new offer
router.post("/", upload.single("image"), async (req, res) => {
  try {
    console.log('[POST Offer] Request received');
    console.log('[POST Offer] Body:', req.body);
    console.log('[POST Offer] File:', req.file);
    
    const { shopId, title, description, startDate, endDate, discount } = req.body as any;

    if (!shopId || !title || !description || !startDate || !endDate || !discount) {
      logger.error(`Missing required fields: shopId=${!!shopId} title=${!!title} description=${!!description} startDate=${!!startDate} endDate=${!!endDate} discount=${!!discount}`);
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate shop exists
    let shop = null;
    if (mongoose.Types.ObjectId.isValid(shopId)) {
      shop = await Shop.findById(shopId);
    }

    // If not found by ID, try finding by slug
    if (!shop) {
      const shops = await Shop.find();
      shop = shops.find(s => createSlug(s.name) === shopId);
    }

    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }
    if (end < start) {
      return res.status(400).json({ message: "End date must be after start date" });
    }

    // Image path
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    const newOffer = new Offer({
      shopId: shop._id,
      title: title.trim(),
      description: description.trim(),
      startDate: start,
      endDate: end,
      discount: discount.trim(),
      imageUrl,
    });

    await newOffer.save();

    logger.info(`Offer created: offerId=${newOffer._id} shopId=${shop._id} title=${newOffer.title}`);
    
    res.status(201).json({ 
      message: "Offer created successfully", 
      offer: newOffer 
    });
  } catch (error: any) {
    logger.error(`Error creating offer: ${error.message}`);
    console.error("Error creating offer:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

// GET /api/offers - get all active offers (not expired)
router.get("/", async (req, res) => {
  try {
    const now = new Date();
    // Get offers that haven't expired yet
    const offers = await Offer.find({ 
      endDate: { $gte: now } 
    })
    .populate('shopId', 'name')
    .sort({ createdAt: -1 });

    // Map to include shop name
    const mappedOffers = offers.map((offer: any) => ({
      _id: offer._id,
      id: offer._id,
      shopId: offer.shopId._id || offer.shopId,
      title: offer.title,
      description: offer.description,
      startDate: offer.startDate,
      endDate: offer.endDate,
      discount: offer.discount,
      image: offer.imageUrl ? `http://localhost:5000${offer.imageUrl}` : undefined,
      shopName: offer.shopId?.name || 'Unknown Shop',
      createdAt: offer.createdAt,
    }));

    res.json(mappedOffers);
  } catch (error) {
    console.error("Error fetching offers:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE expired offers (can be called manually or via cron)
router.delete("/expired", async (req, res) => {
  try {
    const now = new Date();
    const result = await Offer.deleteMany({ endDate: { $lt: now } });
    
    logger.info(`Deleted ${result.deletedCount} expired offers`);
    res.json({ 
      message: `Deleted ${result.deletedCount} expired offers`,
      deletedCount: result.deletedCount 
    });
  } catch (error: any) {
    logger.error(`Error deleting expired offers: ${error.message}`);
    console.error("Error deleting expired offers:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

