import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  shopId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  description?: string;
  createdAt: Date;
}

const ProductSchema: Schema = new Schema({
  shopId: { 
    type: Schema.Types.ObjectId, 
    ref: "Shop", 
    required: true,
    index: true 
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IProduct>("Product", ProductSchema);

