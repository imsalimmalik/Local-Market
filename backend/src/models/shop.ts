import mongoose, { Schema, Document } from "mongoose";

export interface IProduct {
  name: string;
  price: number;
  description?: string;
}

export interface IShop extends Document {
  name: string;
  owner: string;
  address: string;
  phone: string;
  email: string;
  category?: string;
  description?: string;
  logoUrl?: string;
  products: IProduct[];
  createdAt: Date;
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
});

const ShopSchema: Schema = new Schema({
  name: { type: String, required: true },
  owner: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  category: { type: String },
  description: { type: String },
  logoUrl: { type: String },
  products: { type: [ProductSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IShop>("Shop", ShopSchema);
