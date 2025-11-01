import mongoose, { Schema, Document } from "mongoose";

export interface IOffer extends Document {
  shopId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  discount: string;
  imageUrl?: string;
  createdAt: Date;
}

const OfferSchema: Schema = new Schema({
  shopId: { 
    type: Schema.Types.ObjectId, 
    ref: "Shop", 
    required: true,
    index: true 
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true, index: true },
  discount: { type: String, required: true },
  imageUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IOffer>("Offer", OfferSchema);

