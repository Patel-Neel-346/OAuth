import express from "express";
import {
  upload,
  uploadCSV,
  getDataStats,
} from "../controller/csvController.js";
import { Authenticated } from "../middleware/authMiddleware.js";

const DataRouter = express.Router();

/**
 * @swagger
 * /data/upload:
 *   post:
 *     summary: Upload and import CSV data
 *     tags: [Data Import]
 *     security:
 *       - bearerAuth: []
 *     description: Upload a CSV file to be processed and imported into the database
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: file
 *         type: file
 *         description: CSV file to upload
 *         required: true
 *     responses:
 *       200:
 *         description: Data imported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 *       400:
 *         description: Bad request - no file uploaded or invalid file format
 *       401:
 *         description: Unauthorized - user not authenticated
 *       500:
 *         description: Server error
 */
DataRouter.post("/upload", Authenticated, upload.single("file"), uploadCSV);

/**
 * @swagger
 * /data/stats:
 *   get:
 *     summary: Get imported data statistics
 *     tags: [Data Import]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieve summary statistics of the imported data
 *     responses:
 *       200:
 *         description: Data statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     summary:
 *                       type: object
 *       401:
 *         description: Unauthorized - user not authenticated
 *       500:
 *         description: Server error
 */
DataRouter.get("/stats", Authenticated, getDataStats);

export default DataRouter;
