import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxLength: 50
    },
    email: {
      type: String,
      required: true,
      unique: true,
      minLength: 3,
      maxLength: 30
    },
    password: {
      type: String,
      required: true,
      minLength: 6
    },
    phone: {
      type: String,
      required: true,
      maxLength: 10
    },
    role: {
      type: String,
      enum: ["Admin", "Patient", "Doctor", "Staff"],
      required: true,
      default: "Patient"
    },
    profilepic: {
      type: String,
      default: "https://image.png"
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export const User = mongoose.model("User", UserSchema);