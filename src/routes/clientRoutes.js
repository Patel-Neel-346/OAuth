import express from "express";
import { Authenticated } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../helpers/asyncHandler.js";
import { ApiRes } from "../helpers/ApiRespones.js";
import { ApiError } from "../helpers/ApiError.js";
import Data from "../models/Data.js";

const ClientRouter = express.Router();

/**
 * @swagger
 * /clients:
 *   get:
 *     summary: Get all clients with pagination
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order (asc or desc)
 *     responses:
 *       200:
 *         description: List of clients retrieved successfully
 *       401:
 *         description: Unauthorized - user not authenticated
 *       500:
 *         description: Server error
 */
ClientRouter.get(
  "/",
  Authenticated,
  asyncHandler(async (req, res, next) => {
    try {
      // Parse pagination parameters
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const skip = (page - 1) * limit;

      // Parse sorting parameters
      const sortBy = req.query.sortBy || "importedAt";
      const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder;

      // Fetch data with pagination
      const clients = await Data.find({})
        .sort(sortOptions)
        .skip(skip)
        .limit(limit);

      // Get total count for pagination info
      const totalClients = await Data.countDocuments({});
      const totalPages = Math.ceil(totalClients / limit);

      res.status(200).json(
        new ApiRes(
          200,
          {
            clients,
            pagination: {
              totalClients,
              totalPages,
              currentPage: page,
              limit,
            },
          },
          "Clients retrieved successfully"
        )
      );
    } catch (error) {
      console.error("Error fetching clients:", error);
      next(new ApiError(500, "Failed to retrieve clients"));
    }
  })
);

/**
 * @swagger
 * /clients/{id}:
 *   get:
 *     summary: Get client by ID
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Client ID
 *     responses:
 *       200:
 *         description: Client retrieved successfully
 *       404:
 *         description: Client not found
 *       401:
 *         description: Unauthorized - user not authenticated
 *       500:
 *         description: Server error
 */
ClientRouter.get(
  "/:id",
  Authenticated,
  asyncHandler(async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return next(new ApiError(400, "Invalid client ID format"));
      }

      const client = await Data.findById(id);

      if (!client) {
        return next(new ApiError(404, "Client not found"));
      }

      res
        .status(200)
        .json(new ApiRes(200, { client }, "Client retrieved successfully"));
    } catch (error) {
      console.error(`Error fetching client ${req.params.id}:`, error);
      next(new ApiError(500, "Failed to retrieve client"));
    }
  })
);

/**
 * @swagger
 * /clients/filter:
 *   post:
 *     summary: Filter clients dynamically
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: Filtered clients retrieved successfully
 *       401:
 *         description: Unauthorized - user not authenticated
 *       500:
 *         description: Server error
 */
ClientRouter.post(
  "/filter",
  Authenticated,
  asyncHandler(async (req, res, next) => {
    try {
      // Parse pagination parameters
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const skip = (page - 1) * limit;

      // Build filter object from request body
      const filterCriteria = {};

      // Process all filter conditions from the request body
      Object.keys(req.body).forEach((key) => {
        const value = req.body[key];

        // Handle numeric ranges
        if (
          typeof value === "object" &&
          (value.min !== undefined || value.max !== undefined)
        ) {
          filterCriteria[key] = {};
          if (value.min !== undefined) filterCriteria[key].$gte = value.min;
          if (value.max !== undefined) filterCriteria[key].$lte = value.max;
        }
        // Handle arrays for OR conditions
        else if (Array.isArray(value) && value.length > 0) {
          filterCriteria[key] = { $in: value };
        }
        // Handle string pattern matching
        else if (typeof value === "string") {
          filterCriteria[key] = { $regex: value, $options: "i" };
        }
        // Handle boolean and exact match conditions
        else {
          filterCriteria[key] = value;
        }
      });

      console.log("Applied filter criteria:", JSON.stringify(filterCriteria));

      // Fetch filtered data with pagination
      const clients = await Data.find(filterCriteria).skip(skip).limit(limit);

      // Get total matching records for pagination info
      const totalFilteredClients = await Data.countDocuments(filterCriteria);
      const totalPages = Math.ceil(totalFilteredClients / limit);

      res.status(200).json(
        new ApiRes(
          200,
          {
            clients,
            pagination: {
              totalClients: totalFilteredClients,
              totalPages,
              currentPage: page,
              limit,
            },
            filters: req.body,
          },
          "Filtered clients retrieved successfully"
        )
      );
    } catch (error) {
      console.error("Error filtering clients:", error);
      next(new ApiError(500, "Failed to filter clients"));
    }
  })
);

/**
 * @swagger
 * /stats/summary:
 *   get:
 *     summary: Get campaign summary statistics
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       401:
 *         description: Unauthorized - user not authenticated
 *       500:
 *         description: Server error
 */
ClientRouter.get(
  "/stats/summary",
  Authenticated,
  asyncHandler(async (req, res, next) => {
    try {
      const results = {};

      // Total count
      results.totalRecords = await Data.countDocuments();

      // Campaign response statistics
      const targetDistribution = await Data.aggregate([
        { $group: { _id: "$Target", count: { $sum: 1 } } },
      ]);

      results.campaignResponse = targetDistribution.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {});

      // Age distribution statistics
      results.ageDistribution = await Data.aggregate([
        {
          $group: {
            _id: {
              $switch: {
                branches: [
                  { case: { $lte: ["$age", 20] }, then: "<= 20" },
                  { case: { $lte: ["$age", 30] }, then: "21-30" },
                  { case: { $lte: ["$age", 40] }, then: "31-40" },
                  { case: { $lte: ["$age", 50] }, then: "41-50" },
                  { case: { $lte: ["$age", 60] }, then: "51-60" },
                ],
                default: "> 60",
              },
            },
            count: { $sum: 1 },
            yesResponses: {
              $sum: { $cond: [{ $eq: ["$Target", "yes"] }, 1, 0] },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Job distribution statistics
      results.jobDistribution = await Data.aggregate([
        {
          $group: {
            _id: "$job",
            count: { $sum: 1 },
            yesCount: { $sum: { $cond: [{ $eq: ["$Target", "yes"] }, 1, 0] } },
          },
        },
        { $sort: { count: -1 } },
      ]);

      // Housing loan distribution
      results.housingLoanDistribution = await Data.aggregate([
        {
          $group: {
            _id: "$housing",
            count: { $sum: 1 },
            yesCount: { $sum: { $cond: [{ $eq: ["$Target", "yes"] }, 1, 0] } },
          },
        },
      ]);

      // Personal loan distribution
      results.personalLoanDistribution = await Data.aggregate([
        {
          $group: {
            _id: "$loan",
            count: { $sum: 1 },
            yesCount: { $sum: { $cond: [{ $eq: ["$Target", "yes"] }, 1, 0] } },
          },
        },
      ]);

      // Average balance
      const avgBalance = await Data.aggregate([
        { $group: { _id: null, average: { $avg: "$balance" } } },
      ]);
      results.averageBalance =
        avgBalance.length > 0 ? avgBalance[0].average : 0;

      res
        .status(200)
        .json(
          new ApiRes(
            200,
            { statistics: results },
            "Statistics retrieved successfully"
          )
        );
    } catch (error) {
      console.error("Error generating statistics:", error);
      next(new ApiError(500, "Failed to generate statistics"));
    }
  })
);

export default ClientRouter;
