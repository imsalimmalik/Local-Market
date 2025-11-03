import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import Shop from "../models/shop";
import Product from "../models/product";
import Review from "../models/review";
import { logger } from "../utils/logger";
import { createSlug } from "../utils/slug";

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
    const { name, address, phone, email, category, description, products, password } = req.body as any;

    const requiredFields = { name, address, phone, email } as Record<string, any>;
    const missing = Object.entries(requiredFields)
      .filter(([_, v]) => v === undefined || String(v).trim().length === 0)
      .map(([k]) => k);
    if (missing.length > 0) {
      return res.status(400).json({ message: `Missing fields: ${missing.join(', ')}` });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }
    // Store password as plain text as requested (not recommended for production)
    const passwordStored = String(password);

    const existingShop = await Shop.findOne({ email });
    if (existingShop) {
      return res.status(400).json({ message: "Shop already registered with this email" });
    }

    // parse products (may come as JSON string)
    let parsedProducts: Array<{ name: string; price: number; description?: string }> = [];
    if (products) {
      logger.info(`Received products data: ${typeof products}, value: ${JSON.stringify(products).substring(0, 200)}`);
      if (typeof products === "string") {
        try { 
          parsedProducts = JSON.parse(products);
          logger.info(`Parsed ${parsedProducts.length} products from JSON string`);
        } catch (parseError: any) { 
          logger.error(`Error parsing products JSON: ${parseError.message}`);
          parsedProducts = []; 
        }
      } else if (Array.isArray(products)) {
        parsedProducts = products as any;
        logger.info(`Received ${parsedProducts.length} products as array`);
      }
    } else {
      logger.info("No products field found in request body");
    }
    
    logger.info(`Final parsed products count: ${parsedProducts.length}`);

    // logo path
    const logoUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    const newShop = new Shop({
      name,
      address,
      phone,
      email,
      category,
      description,
      logoUrl,
      password: passwordStored,
      products: [], // Keep empty array in shop, products stored separately
    });
    await newShop.save();

    // Save products to separate Product collection
    let savedProductCount = 0;
    if (parsedProducts.length > 0) {
      try {
        logger.info(`Attempting to save ${parsedProducts.length} products for shop ${newShop._id}`);
        
        // Create Product documents with proper ObjectId
        const productsToSave = parsedProducts.map(product => {
          return new Product({
            shopId: newShop._id as mongoose.Types.ObjectId,
            name: product.name.trim(),
            price: parseFloat(product.price.toString()) || 0,
            description: (product.description || '').trim(),
          });
        });
        
        // Save each product individually to catch specific errors
        const savedProducts = [];
        for (const product of productsToSave) {
          try {
            const saved = await product.save();
            savedProducts.push(saved);
            logger.info(`✅ Saved product: ${saved.name} (ID: ${saved._id})`);
          } catch (err: any) {
            logger.error(`❌ Error saving product ${product.name}: ${err.message}`);
            console.error(`Error saving product ${product.name}:`, err);
          }
        }
        
        savedProductCount = savedProducts.length;
        logger.info(`Successfully saved ${savedProductCount} out of ${parsedProducts.length} products to database`);
        
        if (savedProductCount === 0) {
          logger.error(`⚠️ No products were saved for shop ${newShop._id}`);
        }
      } catch (productError: any) {
        logger.error(`Error saving products: ${productError.message}`);
        console.error("Error saving products:", productError);
        // Continue even if products fail to save, shop is already saved
      }
    } else {
      logger.info(`No products to save for shop ${newShop._id}`);
    }

    // Verify products were saved by counting in database
    const verifiedCount = await Product.countDocuments({ shopId: newShop._id });
    if (verifiedCount !== savedProductCount) {
      logger.error(`⚠️ Product count mismatch: Expected ${savedProductCount}, Found in DB: ${verifiedCount}`);
    }
    
    logger.info(`Details uploaded: shopId=${newShop._id} name=${newShop.name} email=${newShop.email}, products saved: ${savedProductCount} (verified: ${verifiedCount})`);
    res.status(201).json({ 
      message: "Shop registered successfully", 
      shop: newShop,
      productsSaved: savedProductCount,
      productsInDb: verifiedCount
    });
  } catch (error: any) {
    logger.error(`Error registering shop: ${error.message}`);
    console.error("Error registering shop:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

// Helper to fetch shop by id or slug
async function findShopByIdentifier(identifier: string) {
  let shop = null as any;
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    shop = await Shop.findById(identifier);
  }
  if (!shop) {
    const shops = await Shop.find();
    shop = shops.find((s: any) => createSlug(s.name) === identifier);
  }
  return shop;
}

// POST /api/shops/:identifier/verify - verify password
router.post("/:identifier/verify", async (req, res) => {
  try {
    const { identifier } = req.params as { identifier: string };
    const { password } = req.body as { password: string };
    if (!password) return res.status(400).json({ message: "Password required" });
    const shop: any = await findShopByIdentifier(identifier);
    if (!shop || !shop.password) return res.status(404).json({ message: "Shop not found" });
    const ok = String(shop.password) === String(password);
    return res.json({ ok });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
});

// POST /api/shops/:identifier/products - add product (password required)
router.post("/:identifier/products", async (req, res) => {
  try {
    const { identifier } = req.params as { identifier: string };
    const { password, name, price, description } = req.body as any;
    if (!password) return res.status(400).json({ message: 'Password required' });
    if (!name || price === undefined) return res.status(400).json({ message: 'Name and price required' });
    const shop: any = await findShopByIdentifier(identifier);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    // verify password (plain text)
    if (String(shop.password) !== String(password)) return res.status(401).json({ message: 'Invalid password' });

    const newProduct = new Product({
      shopId: shop._id as mongoose.Types.ObjectId,
      name: String(name).trim(),
      price: parseFloat(price),
      description: String(description || '').trim(),
    });
    const saved = await newProduct.save();
    return res.status(201).json(saved);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
});

// PUT /api/shops/:identifier/products/:productId - update product (password required)
router.put("/:identifier/products/:productId", async (req, res) => {
  try {
    const { identifier, productId } = req.params as any;
    const { password, name, price, description } = req.body as any;
    if (!password) return res.status(400).json({ message: 'Password required' });
    const shop: any = await findShopByIdentifier(identifier);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    if (String(shop.password) !== String(password)) return res.status(401).json({ message: 'Invalid password' });

    const update: any = {};
    if (name !== undefined) update.name = String(name).trim();
    if (price !== undefined) update.price = parseFloat(price);
    if (description !== undefined) update.description = String(description).trim();
    const updated = await Product.findOneAndUpdate({ _id: productId, shopId: shop._id }, update, { new: true });
    if (!updated) return res.status(404).json({ message: 'Product not found' });
    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
});

// DELETE /api/shops/:identifier/products/:productId - delete product (password required)
router.delete("/:identifier/products/:productId", async (req, res) => {
  try {
    const { identifier, productId } = req.params as any;
    const { password } = req.body as any;
    if (!password) return res.status(400).json({ message: 'Password required' });
    const shop: any = await findShopByIdentifier(identifier);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    const [salt, hash] = String(shop.password || '').split(":");
    const crypto = await import('crypto');
    const derived = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    if (derived !== hash) return res.status(401).json({ message: 'Invalid password' });

    const deleted = await Product.findOneAndDelete({ _id: productId, shopId: shop._id });
    if (!deleted) return res.status(404).json({ message: 'Product not found' });
    return res.json({ ok: true });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
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

// GET /api/shops/:identifier/products - get products by shop identifier (id or slug)
router.get("/:identifier/products", async (req, res) => {
  try {
    const { identifier } = req.params as { identifier: string };
    
    // Find shop by ID or slug
    let shop = null;
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      shop = await Shop.findById(identifier);
    }
    
    if (!shop) {
      const shops = await Shop.find();
      shop = shops.find(s => createSlug(s.name) === identifier);
    }
    
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }
    
    // Find products for this shop
    const products = await Product.find({ shopId: shop._id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/shops/:identifier/reviews - submit a review for a shop
router.post("/:identifier/reviews", async (req, res) => {
  try {
    const { identifier } = req.params as { identifier: string };
    console.log(`[POST Review] Requested identifier: ${identifier}`);
    const { customerName, rating, comment } = req.body;
    
    // Validate input
    if (!customerName || !rating || !comment) {
      return res.status(400).json({ message: "Customer name, rating, and comment are required" });
    }
    
    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }
    
    // Find shop by ID or slug
    let shop = null;
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      shop = await Shop.findById(identifier);
    }
    
    if (!shop) {
      const shops = await Shop.find();
      shop = shops.find(s => createSlug(s.name) === identifier);
    }
    
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }
    
    // Create review
    const newReview = new Review({
      shopId: shop._id,
      customerName: customerName.trim(),
      rating: ratingNum,
      comment: comment.trim(),
    });
    
    await newReview.save();
    
    // Calculate new average rating for the shop
    const reviews = await Review.find({ shopId: shop._id });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    
    // Update shop rating (round to 1 decimal place)
    (shop as any).rating = Math.round(averageRating * 10) / 10;
    await shop.save();
    
    const updatedRating = Math.round(averageRating * 10) / 10;
    logger.info(`Review submitted for shop ${shop._id} by ${customerName}, new average rating: ${updatedRating}`);
    
    res.status(201).json({ 
      message: "Review submitted successfully", 
      review: newReview,
      shopRating: updatedRating,
      totalReviews: reviews.length
    });
  } catch (error: any) {
    logger.error(`Error submitting review: ${error.message}`);
    console.error("Error submitting review:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/shops/:identifier/reviews - get reviews for a shop
router.get("/:identifier/reviews", async (req, res) => {
  try {
    const { identifier } = req.params as { identifier: string };
    console.log(`[GET Reviews] Requested identifier: ${identifier}`);
    
    // Find shop by ID or slug
    let shop = null;
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      shop = await Shop.findById(identifier);
    }
    
    if (!shop) {
      const shops = await Shop.find();
      shop = shops.find(s => createSlug(s.name) === identifier);
    }
    
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }
    
    // Find reviews for this shop
    const reviews = await Review.find({ shopId: shop._id }).sort({ createdAt: -1 });
    
    // Calculate average rating
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = reviews.length > 0 ? Math.round((totalRating / reviews.length) * 10) / 10 : 0;
    
    res.json({
      reviews,
      averageRating,
      totalReviews: reviews.length
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/shops/:identifier - get shop by id or slug
// This route must come LAST to avoid matching /reviews or /products as identifiers
router.get("/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params as { identifier: string };
    
    // Don't match if identifier contains a slash (could be reviews/products route)
    if (identifier.includes('/')) {
      return res.status(404).json({ message: "Route not found" });
    }
    
    // Check if identifier is a valid MongoDB ObjectId
    let shop = null;
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      shop = await Shop.findById(identifier);
    }
    
    // If not found by ID or not a valid ObjectId, try finding by slug
    if (!shop) {
      const shops = await Shop.find();
      shop = shops.find(s => createSlug(s.name) === identifier);
    }
    
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }
    res.json(shop);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
