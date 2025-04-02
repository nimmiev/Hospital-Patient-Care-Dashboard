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
      default: "https://img.freepik.com/free-vector/user-circles-set_78370-4704.jpg?t=st=1742623449~exp=1742627049~hmac=3bb4b47fbe4a2fe8f6a3b06ae7708f672a14c262d9290750d8205209a9252ed9&w=740"
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