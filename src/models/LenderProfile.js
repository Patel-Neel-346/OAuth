import mongoose from "mongoose";
import { ROLE_TYPES } from "./Role.js";

const LenderProfileSchema = new mongoose.Schema({
  roleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
    required: true,
  },
  lendingCapacity: {
    type: Number,
    required: true,
  },
  interestRate: {
    personal: {
      type: Number,
      required: true,
    },
    business: {
      type: Number,
      required: true,
    },
    home: {
      type: Number,
      required: true,
    },
  },
  activeSince: {
    type: Date,
    default: Date.now,
  },
  totalFundsLent: {
    type: Number,
    default: 0,
  },
  availableFunds: {
    type: Number,
    default: 0,
  },
  activeLoans: {
    type: Number,
    default: 0,
  },
  loanSuccessRate: {
    type: Number,
    default: 0,
  },
  verificationStatus: {
    type: String,
    enum: ["pending", "verified", "rejected"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Validate that the role is a LENDER type
LenderProfileSchema.pre("save", async function (next) {
  this.updatedAt = Date.now();

  try {
    const Role = mongoose.model("Role");
    const role = await Role.findById(this.roleId);

    if (!role) {
      throw new Error("Role not found");
    }

    if (role.name !== ROLE_TYPES.LENDER) {
      throw new Error("Invalid role type. Must be a LENDER role.");
    }

    next();
  } catch (error) {
    next(error);
  }
});

const LenderProfile = mongoose.model("LenderProfile", LenderProfileSchema);

export default LenderProfile;
