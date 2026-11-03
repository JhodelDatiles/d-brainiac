import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    isVerified: { type: Boolean, default: false },
    // Stored as a SHA-256 hash, never the raw token
    verificationToken: { type: String, select: false },
    verificationTokenExpires: { type: Date, select: false },
  },
  { timestamps: true },
);

export const User = model("User", userSchema);
