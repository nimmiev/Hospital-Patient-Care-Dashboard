import mongoose from "mongoose";

const AppoinmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    appointmentDate: { type: String, required: true },
    appointmentTime: { type: String, required: true },
    status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'], default: 'Scheduled' },
    consultationNotes: { type: String }
  },
  {
    timestamps: true
  }
);

export const Appoinment = mongoose.model("Appoinment", AppoinmentSchema);