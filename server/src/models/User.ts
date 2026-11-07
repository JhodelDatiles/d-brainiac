import { Schema, model } from "mongoose";
import { GENDERS } from "../constants/gender.ts";

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
    // Bumped on logout so old JWTs stop working
    tokenVersion: { type: Number, default: 0 },
    // Stored as a SHA-256 hash, never the raw token
    verificationToken: { type: String, select: false },
    verificationTokenExpires: { type: Date, select: false },
    name: { type: String, trim: true, maxlength: 50 },
    bio: { type: String, trim: true, maxlength: 300, default: "" },
    gender: { type: String, enum: GENDERS, default: "prefer-not-to-say" },
    avatarUrl: { type: String },
    // Stored as a SHA-256 hash, never the raw token
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  { timestamps: true },
);

// Auto-delete accounts that never confirmed their email after 7 days
userSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 7 * 24 * 60 * 60,
    partialFilterExpression: { isVerified: false },
  },
);

export const User = model("User", userSchema);
