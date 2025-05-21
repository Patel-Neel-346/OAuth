// src/models/Account.js
import mongoose from "mongoose";

const AccountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  accountNumber: {
    type: String,
    unique: true,
    required: true,
  },
  accountType: {
    type: String,
    enum: ["savings", "checking", "loan", "credit", "investment"],
    required: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
  currency: {
    type: String,
    default: "USD",
  },
  status: {
    type: String,
    enum: ["active", "inactive", "suspended", "closed"],
    default: "active",
  },
  interestRate: {
    type: Number,
    default: 0,
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

// Update timestamps on save
AccountSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Account = mongoose.model("Account", AccountSchema);
export default Account;
