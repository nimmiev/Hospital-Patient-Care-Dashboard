import mongoose from "mongoose";

const BloodbankSchema = new mongoose.Schema(
  {
    bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'], required: true },
    quantity: { type: Number, required: true },
    hospitalName: { type: String, required: true },
    location: { type: String, required: true },
    contactNumber: { type: String, required: true },
    available: { type: Boolean, default: false },
  },
  {
    timestamps: true
  }
);

export const Bloodbank = mongoose.model("Bloodbank", BloodbankSchema);