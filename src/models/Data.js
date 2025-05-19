import mongoose from "mongoose";

// Define CSV data model schema
const DataSchema = new mongoose.Schema({
  age: Number,
  job: String,
  marital: String,
  education: String,
  default: String,
  balance: Number,
  housing: String,
  loan: String,
  contact: String,
  day: Number,
  month: String,
  duration: Number,
  campaign: Number,
  pdays: Number,
  previous: Number,
  poutcome: String,
  Target: String,
  importedAt: {
    type: Date,
    default: Date.now,
  },
});

const Data = mongoose.models.Data || mongoose.model("Data", DataSchema);

export default Data;
