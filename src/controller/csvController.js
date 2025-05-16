import { asyncHandler } from "../helpers/asyncHandler.js";
import { ApiRes } from "../helpers/ApiRespones.js";
import { ApiError } from "../helpers/ApiError.js";
import { processCSVFile, getDataSummary } from "../utils/csvUtils.js";
import fs from "fs";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";

// Set up storage for uploaded files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "../../uploads");

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

// File filter to accept only CSV files
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Only CSV files are allowed"), false);
  }
};

// Create multer upload instance
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
});

/**
 * Upload and process CSV file
 */
export const uploadCSV = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ApiError(400, "No file uploaded or file is not CSV"));
  }

  try {
    const filePath = req.file.path;
    const importStats = await processCSVFile(filePath);

    // Clean up the temporary file after processing
    fs.unlinkSync(filePath);

    res.status(200).json(
      new ApiRes(
        200,
        {
          stats: importStats,
        },
        "CSV data imported successfully"
      )
    );
  } catch (error) {
    // Clean up file if it exists and there was an error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
});

/**
 * Get summary of imported data
 */
export const getDataStats = asyncHandler(async (req, res, next) => {
  try {
    const summary = await getDataSummary();
    res.status(200).json(
      new ApiRes(
        200,
        {
          summary,
        },
        "Data summary retrieved successfully"
      )
    );
  } catch (error) {
    next(error);
  }
});
