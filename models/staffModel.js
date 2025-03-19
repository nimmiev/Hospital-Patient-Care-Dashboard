import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    roleDescription: { type: String, required: true },
    assignedTask: { type: Boolean, default: false },//to know atleast one task added or not
    taskCount: { type: Number, default: 0},
    approved: { type: Boolean, default:false }
  },
  {
    timestamps: true
  }
);

export const Staff = mongoose.model("Staff", staffSchema);