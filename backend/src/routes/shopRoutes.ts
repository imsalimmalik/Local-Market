import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Shop from "../models/shop";
import { logger } from "../utils/logger";

const router = express.Router();

// configure multer storage (backend/uploads)
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, "");
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

// POST /api/shops/register
router.post("/register", upload.single("logo"), async (req, res) => {
  try {
    const { name, owner, address, phone, email, category, description, products } = req.body as any;

    if (!name || !owner || !address || !phone || !email) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingShop = await Shop.findOne({ email });
    if (existingShop) {
      return res.status(400).json({ message: "Shop already registered with this email" });
    }

    // parse products (may come as JSON string)
    let parsedProducts: Array<{ name: string; price: number; description?: string }> = [];
    if (products) {
      if (typeof products === "string") {
        try { parsedProducts = JSON.parse(products); } catch { parsedProducts = []; }
      } else if (Array.isArray(products)) {
        parsedProducts = products as any;
      }
    }

    // logo path
    const logoUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    const newShop = new Shop({
      name,
      owner,
      address,
      phone,
      email,
      category,
      description,
      logoUrl,
      products: parsedProducts,
    });
    await newShop.save();

    logger.info(`Details uploaded: shopId=${newShop._id} name=${newShop.name} email=${newShop.email}`);
    res.status(201).json({ message: "Shop registered successfully", shop: newShop });
  } catch (error) {
    console.error("Error registering shop:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/shops - list recent shops (for quick verification)
router.get("/", async (_req, res) => {
  try {
    const shops = await Shop.find().sort({ createdAt: -1 }).limit(10);
    res.json(shops);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
