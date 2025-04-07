import mongoose from "mongoose";

const DoctorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    medicalLicense: { type: String, required: true },
    qualification: { type: String, required: true },
    experience: { type: String, required: true },
    department: { type: String, required: true },
    schedule: { type: Boolean, default: false }, // to know scheduled atleast any one patient or not
    approved: { type: Boolean, default: null }
  },
  {
    timestamps: true
  }
);

export const Doctor = mongoose.model("Doctor", DoctorSchema);