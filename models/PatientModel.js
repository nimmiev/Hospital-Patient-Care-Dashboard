import mongoose from "mongoose";

const PatientSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Basic Information
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    address: { type: String, required: true },
    emergencyContact: {
      name: { type: String, required: true },
      phone: { type: String, required: true }
    },
    // Medical History
    preExistingConditions: [{ type: String }], // List of conditions - (e.g., Diabetes, Hypertension, Asthma)
    allergies: [{ type: String }], // List of allergies - (Medications, Food, Environmental)
    pastSurgeries: [{ type: String }], // List of past surgeries

    // Current Health Status
    medications: [{ type: String }], // List of medications
    chronicDiseases: [{ type: String }], // List of diseases
    bloodType: { type: String, enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"], required: true },
    height: { type: Number, required: true }, // In cm
    weight: { type: Number, required: true }, // In kg
    smoking: { type: Boolean, default: false },
    alcoholConsumption: { type: Boolean, default: false },

    // Insurance Information -  (if applicable):
    insurance: {
      provider: { type: String },
      policyNumber: { type: String },
      expirationDate: { type: Date }
    },

    // Family Medical History - (e.g., Heart Disease, Cancer, Diabetes)
    familyHistory: [{ condition: String, relation: String }], // Example: { condition: "Diabetes", relation: "Father" }

    // Lifestyle & Habits
    dietPreference: { type: String, enum: ["Vegetarian", "Non-Vegetarian", "Vegan", "Other"] },
    physicalActivityLevel: { type: String, enum: ["Sedentary", "Moderate", "Active"] },
    sleepPatterns: { type: String },

    // Emergency Medical Preferences
    emergencyPreferences: {
      preferredHospital: { type: String },
      primaryCarePhysician: { type: String },
      doNotResuscitate: { type: Boolean, default: false } //(if applicable)
    },
    scheduled: { type:Boolean, default: false}
  },
  {
    timestamps: true
  }
);

export const Patient = mongoose.model("Patient", PatientSchema);