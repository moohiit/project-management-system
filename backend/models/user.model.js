import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true }, // for login
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["Admin", "Client"], default: "Client" },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
