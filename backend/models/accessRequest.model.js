import mongoose from "mongoose";

const accessRequestSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "DENIED"],
      default: "PENDING",
    },
    decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const AccessRequest = mongoose.model(
  "AccessRequest",
  accessRequestSchema
);
