import { asyncHandler } from "../helpers/asyncHandler.js";
import { ApiRes } from "../helpers/ApiRespones.js";
import { ApiError } from "../helpers/ApiError.js";
import { processCSVFile, getDataSummary } from "../utils/csvUtils.js";
import fs from "fs";

export const uploadCSV = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ApiError(400, "No file uploaded or file is not CSV"));
  }

  try {
    const filePath = req.file.path;
    const importStats = await processCSVFile(filePath);

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
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
});

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
