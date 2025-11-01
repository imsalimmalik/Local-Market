import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  shopId: mongoose.Types.ObjectId;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

const ReviewSchema: Schema = new Schema({
  shopId: { 
    type: Schema.Types.ObjectId, 
    ref: "Shop", 
    required: true,
    index: true 
  },
  customerName: { type: String, required: true },
  rating: { 
    type: Number, 
    required: true,
    min: 1,
    max: 5 
  },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IReview>("Review", ReviewSchema);

