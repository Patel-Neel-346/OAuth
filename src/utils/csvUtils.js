import fs from "fs";
import Papa from "papaparse";
import { ApiError } from "../helpers/ApiError.js";
import Data from "../models/Data.js";
import { type } from "os";

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

  for (const field of requiredFields) {
    if (row[field] === undefined || row[field] === null || row[field] === "") {
      errors.push(`Missing required field: ${field}`);
    }
  }

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

          results.data.forEach((row) => {
            const cleanRow = {};
            Object.keys(row).forEach((key) => {
              const cleanKey = key.trim();
              cleanRow[cleanKey] = row[key];
            });

            const validation = validateRow(cleanRow);
            if (!validation.isValid) {
              stats.skipped.validation++;
              stats.errors.push(
                `Row validation failed: ${validation.errors.join(", ")}`
              );
              return;
            }

            const balance = Number(cleanRow.balance);
            if (balance <= 2) {
              stats.skipped.balance++;
              return;
            }

            validRecords.push(cleanRow);
          });

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

  const CompaingYesData = await Data.aggregate([
    {
      $match: { Target: "yes" },
    },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        users: { $push: { age: "$age", job: "$job", balance: "$balance" } },
      },
    },
  ]);

  // db.students
  //   .aggregate([
  //     {
  //       $unwind: "$subjects"
  //     },
  //     {
  //       $match: {
  //         "subjects.name": "Math",
  //       },
  //     },
  //     {
  //       $sort: {
  //         "subjects.marks": -1,
  //       },
  //     },
  //     {
  //       $project: {
  //         name: 1,
  //       },
  //     },
  //   ])
  //   .limit(1);
  // db.students.find(
  //   {
  //     subjects: {
  //       $elemMatch: {
  //         assessments: {
  //           $elemMatch: {
  //             $and: [{ score: { $gt: 75 } }, { score: { $lt: 90 } }],
  //           },
  //         },
  //       },
  //     },
  //   },
  //   { fullName: 1, "subjects.assessments.score": 1 }
  // );
  return {
    total,
    avgBalance: avgBalance.length > 0 ? avgBalance[0].average : 0,
    jobDistribution,
    CompaingYesData,
  };
};
