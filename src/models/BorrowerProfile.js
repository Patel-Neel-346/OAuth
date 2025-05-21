import mongoose from "mongoose";
import { ROLE_TYPES } from "./Role.js";

const BorrowerProfileSchema = new mongoose.Schema({
  roleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
    required: true,
  },
  creditScore: {
    type: Number,
    min: 300,
    max: 850,
  },
  totalDebt: {
    type: Number,
    default: 0,
  },
  monthlyIncome: {
    type: Number,
    required: true,
  },
  employmentStatus: {
    type: String,
    enum: ["employed", "self-employed", "unemployed", "retired", "student"],
    required: true,
  },
  employmentDuration: {
    type: Number, // In months
    default: 0,
  },
  debtToIncomeRatio: {
    type: Number,
    default: 0,
  },
  loanHistory: {
    completedLoans: {
      type: Number,
      default: 0,
    },
    defaultedLoans: {
      type: Number,
      default: 0,
    },
    activeLoans: {
      type: Number,
      default: 0,
    },
  },
  verificationDocuments: [
    {
      documentType: {
        type: String,
        enum: ["id", "income", "address", "employment"],
      },
      documentUrl: String,
      uploadDate: {
        type: Date,
        default: Date.now,
      },
      verificationStatus: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "pending",
      },
    },
  ],
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

// Calculate debt-to-income ratio and validate role type before saving
BorrowerProfileSchema.pre("save", async function (next) {
  this.updatedAt = Date.now();

  // Calculate debt-to-income ratio
  if (this.monthlyIncome > 0) {
    const estimatedMonthlyDebt = this.totalDebt * 0.03;
    this.debtToIncomeRatio = (
      estimatedMonthlyDebt / this.monthlyIncome
    ).toFixed(2);
  }

  try {
    // Validate that the role is a BORROWER type
    const Role = mongoose.model("Role");
    const role = await Role.findById(this.roleId);

    if (!role) {
      throw new Error("Role not found");
    }

    if (role.name !== ROLE_TYPES.BORROWER) {
      throw new Error("Invalid role type. Must be a BORROWER role.");
    }

    next();
  } catch (error) {
    next(error);
  }
});

const BorrowerProfile = mongoose.model(
  "BorrowerProfile",
  BorrowerProfileSchema
);

export default BorrowerProfile;
