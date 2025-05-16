import fs from "fs";
import Papa from "papaparse";
import mongoose from "mongoose";
import { ApiError } from "../helpers/ApiError.js";

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

// Create the model if it doesn't exist
const Data = mongoose.models.Data || mongoose.model("Data", DataSchema);

const validateRow = (row) => {
  const errors = [];
  const requiredFields = [
    "age",
    "job",
    "marital",
    "education",
    "default",
    "balance",
    "housing",
    "loan",
  ];

  // Check for required fields
  for (const field of requiredFields) {
    if (row[field] === undefined || row[field] === null || row[field] === "") {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Validate balance is a number
  if (row.balance !== undefined && isNaN(Number(row.balance))) {
    errors.push("Balance must be a number");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const processCSVFile = async (filePath) => {
  return new Promise((resolve, reject) => {
    const stats = {
      total: 0,
      imported: 0,
      skipped: {
        validation: 0,
        balance: 0,
      },
      errors: [],
    };

    if (!fs.existsSync(filePath)) {
      return reject(new ApiError(404, "File not found"));
    }

    // Read file and parse CSV
    const fileContent = fs.readFileSync(filePath, { encoding: "utf8" });

    Papa.parse(fileContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      delimitersToGuess: [",", "\t", "|", ";"],
      complete: async (results) => {
        try {
          stats.total = results.data.length;
          const validRecords = [];

          // Process each row
          results.data.forEach((row) => {
            // Trim whitespace from header names
            const cleanRow = {};
            Object.keys(row).forEach((key) => {
              const cleanKey = key.trim();
              cleanRow[cleanKey] = row[key];
            });

            // Validate row
            const validation = validateRow(cleanRow);
            if (!validation.isValid) {
              stats.skipped.validation++;
              stats.errors.push(
                `Row validation failed: ${validation.errors.join(", ")}`
              );
              return;
            }

            // Check balance threshold
            const balance = Number(cleanRow.balance);
            if (balance <= 2) {
              stats.skipped.balance++;
              return;
            }

            // Add to valid records for batch insert
            validRecords.push(cleanRow);
          });

          // Insert valid records to database
          if (validRecords.length > 0) {
            await Data.insertMany(validRecords);
            stats.imported = validRecords.length;
          }

          resolve(stats);
        } catch (error) {
          reject(new ApiError(500, `Error processing CSV: ${error.message}`));
        }
      },
      error: (error) => {
        reject(new ApiError(500, `CSV parsing error: ${error.message}`));
      },
    });
  });
};

export const getDataSummary = async () => {
  const total = await Data.countDocuments();
  const avgBalance = await Data.aggregate([
    { $group: { _id: null, average: { $avg: "$balance" } } },
  ]);

  const jobDistribution = await Data.aggregate([
    { $group: { _id: "$job", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  return {
    total,
    avgBalance: avgBalance.length > 0 ? avgBalance[0].average : 0,
    jobDistribution,
  };
};

export default {
  Data,
  processCSVFile,
  getDataSummary,
};
