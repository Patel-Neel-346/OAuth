import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  fromAccount: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
  toAccount: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
  amount: { type: Number, required: true },
  type: {
    type: String,
    enum: ["deposit", "withdrawal", "transfer", "payment", "fee", "interest"],
    required: true,
  },
  description: { type: String },
  status: {
    type: String,
    enum: ["pending", "completed", "failed", "cancelled"],
    default: "pending",
  },
  reference: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  processedAt: { type: Date },
});

const Transaction = new mongoose.model("Transaction", TransactionSchema);

export default Transaction;
