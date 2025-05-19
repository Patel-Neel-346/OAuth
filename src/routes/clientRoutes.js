import express from "express";
import { Authenticated } from "../middleware/authMiddleware.js";

import {
  FilterDataOfClient,
  getClientData,
  getClientDataById,
  GetStatusSummary,
} from "../controller/ClientControlller.js";

const ClientRouter = express.Router();

/**
 * @swagger
 * /clients:
 *   get:
 *     summary: Fetch all clients
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
ClientRouter.get("/", Authenticated, getClientData);

/**
 * @swagger
 * /clients/{id}:
 *   get:
 *     summary: Fetch client by ID
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
ClientRouter.get("/:id", Authenticated, getClientDataById);

/**
 * @swagger
 * /clients/filter:
 *   post:
 *     summary: Filter clients dynamically
 *     description: Filter by age, job, loan status, etc. Filter is dynamic - you can pass any key with any value.
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
ClientRouter.post("/filter", Authenticated, FilterDataOfClient);

/**
 * @swagger
 * /clients/stats/summary:
 *   get:
 *     summary: Return campaign statistics
 *     description: Return stats like how many said 'yes' to campaign
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
ClientRouter.get("/stats/summary", Authenticated, GetStatusSummary);

export default ClientRouter;
