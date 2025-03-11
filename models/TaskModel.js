import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
    taskDescription: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Completed', 'Reassigned'], default: 'Pending' }
  },
  {
    timestamps: true
  }
);

export const Task = mongoose.model("Task", TaskSchema);