import mongoose from "mongoose";

const AppoinmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    appointmentDate: { type: String, required: true },
    appointmentTime: { type: String, required: true },
    status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled', 'Requested'], default: 'Scheduled' },
    consultationNotes: { type: String },
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true
  }
);

export const Appoinment = mongoose.model("Appoinment", AppoinmentSchema);