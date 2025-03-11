import mongoose from "mongoose";

const AppoinmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    appointmentDate: { type: Date, required: true },
    status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'], default: 'Scheduled' },
    consultationNotes: { type: String }
  },
  {
    timestamps: true
  }
);

export const Appoinments = mongoose.model("Appoinment", AppoinmentSchema);