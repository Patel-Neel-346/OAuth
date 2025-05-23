// src/routes/transactionRoutes.js
import express from "express";
import {
  depositFunds,
  withdrawFunds,
  transferFunds,
  transferByAccountNumber,
  getAccountBalance,
  getTransactionHistory,
  processInterestPayment,
  getTransactionDetails,
  getAllUserTransactions,
  cancelTransaction,
  reverseTransaction,
  getTransactionStatistics,
} from "../controller/TransactionController.js";
import { Authenticated } from "../middleware/authMiddleware.js";
import { body, param, query, validationResult } from "express-validator";
import { ApiError } from "../helpers/ApiError.js";
import {
  DepositFunds,
  WithDrawFunds,
} from "../controller/TransactionControllerV2.js";

const TransactionRouter = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = {};
    errors.array().forEach((error) => {
      formattedErrors[error.path] = error.msg;
    });
    return next(new ApiError(400, "Validation failed", errors.array()));
  }
  next();
};

// Validation rules for deposit
const depositValidation = [
  body("accountId").isMongoId().withMessage("Invalid account ID format"),
  body("amount")
    .isNumeric()
    .withMessage("Amount must be a number")
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be greater than 0"),
  body("description")
    .optional()
    .isLength({ min: 1, max: 500 })
    .withMessage("Description must be between 1 and 500 characters"),
];

// Validation rules for withdrawal
const withdrawalValidation = [
  body("accountId").isMongoId().withMessage("Invalid account ID format"),
  body("amount")
    .isNumeric()
    .withMessage("Amount must be a number")
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be greater than 0"),
  body("description")
    .optional()
    .isLength({ min: 1, max: 500 })
    .withMessage("Description must be between 1 and 500 characters"),
];

// Validation rules for transfer
const transferValidation = [
  body("fromAccountId")
    .isMongoId()
    .withMessage("Invalid from account ID format"),
  body("toAccountId").isMongoId().withMessage("Invalid to account ID format"),
  body("amount")
    .isNumeric()
    .withMessage("Amount must be a number")
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be greater than 0"),
  body("description")
    .optional()
    .isLength({ min: 1, max: 500 })
    .withMessage("Description must be between 1 and 500 characters"),
];

// Validation rules for transfer by account number
const transferByAccountNumberValidation = [
  body("fromAccountId")
    .isMongoId()
    .withMessage("Invalid from account ID format"),
  body("toAccountNumber")
    .isLength({ min: 8, max: 20 })
    .withMessage("Account number must be between 8 and 20 characters"),
  body("amount")
    .isNumeric()
    .withMessage("Amount must be a number")
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be greater than 0"),
  body("description")
    .optional()
    .isLength({ min: 1, max: 500 })
    .withMessage("Description must be between 1 and 500 characters"),
];

// Query validation for transaction history
const transactionHistoryValidation = [
  param("accountId").isMongoId().withMessage("Invalid account ID format"),
  query("type")
    .optional()
    .isIn(["deposit", "withdrawal", "transfer", "payment", "fee", "interest"])
    .withMessage("Invalid transaction type"),
  query("status")
    .optional()
    .isIn(["pending", "completed", "failed", "cancelled"])
    .withMessage("Invalid transaction status"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("dateFrom")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format for dateFrom"),
  query("dateTo")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format for dateTo"),
  query("amountMin")
    .optional()
    .isNumeric()
    .withMessage("Amount minimum must be a number"),
  query("amountMax")
    .optional()
    .isNumeric()
    .withMessage("Amount maximum must be a number"),
];

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Transaction ID
 *         fromAccount:
 *           type: string
 *           description: Source account ID
 *         toAccount:
 *           type: string
 *           description: Destination account ID
 *         amount:
 *           type: number
 *           description: Transaction amount
 *         type:
 *           type: string
 *           enum: [deposit, withdrawal, transfer, payment, fee, interest]
 *           description: Transaction type
 *         description:
 *           type: string
 *           description: Transaction description
 *         status:
 *           type: string
 *           enum: [pending, completed, failed, cancelled]
 *           description: Transaction status
 *         reference:
 *           type: string
 *           description: Transaction reference number
 *         metadata:
 *           type: object
 *           description: Additional transaction data
 *         createdAt:
 *           type: string
 *           format: date-time
 *         processedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /transactions/deposit:
 *   post:
 *     summary: Deposit funds to account
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accountId
 *               - amount
 *             properties:
 *               accountId:
 *                 type: string
 *                 description: Account ID to deposit to
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *                 description: Deposit amount
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: Optional transaction description
 *     responses:
 *       200:
 *         description: Deposit completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 statusCode:
 *                   type: number
 *                 data:
 *                   type: object
 *                   properties:
 *                     transaction:
 *                       $ref: '#/components/schemas/Transaction'
 *                     account:
 *                       type: object
 *                       properties:
 *                         accountNumber:
 *                           type: string
 *                         newBalance:
 *                           type: number
 *                         currency:
 *                           type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request - validation errors
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Account not found
 *       500:
 *         description: Server error
 */
TransactionRouter.post(
  "/deposit",
  Authenticated,
  // depositValidation,
  // handleValidationErrors,
  // depositFunds

  DepositFunds
);

/**
 * @swagger
 * /transactions/withdraw:
 *   post:
 *     summary: Withdraw funds from account
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accountId
 *               - amount
 *             properties:
 *               accountId:
 *                 type: string
 *                 description: Account ID to withdraw from
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *                 description: Withdrawal amount
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: Optional transaction description
 *     responses:
 *       200:
 *         description: Withdrawal completed successfully
 *       400:
 *         description: Bad request - insufficient funds or validation errors
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Account not found
 *       500:
 *         description: Server error
 */
TransactionRouter.post(
  "/withdraw",
  Authenticated,
  // withdrawalValidation,
  // handleValidationErrors,
  // withdrawFunds
  WithDrawFunds
);

/**
 * @swagger
 * /transactions/transfer:
 *   post:
 *     summary: Transfer funds between accounts
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fromAccountId
 *               - toAccountId
 *               - amount
 *             properties:
 *               fromAccountId:
 *                 type: string
 *                 description: Source account ID
 *               toAccountId:
 *                 type: string
 *                 description: Destination account ID
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *                 description: Transfer amount
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: Optional transaction description
 *     responses:
 *       200:
 *         description: Transfer completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 statusCode:
 *                   type: number
 *                 data:
 *                   type: object
 *                   properties:
 *                     transaction:
 *                       $ref: '#/components/schemas/Transaction'
 *                     fromAccount:
 *                       type: object
 *                     toAccount:
 *                       type: object
 *                     transferFee:
 *                       type: number
 *                       nullable: true
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request - insufficient funds, currency mismatch, or validation errors
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Account not found
 *       500:
 *         description: Server error
 */
TransactionRouter.post(
  "/transfer",
  Authenticated,
  transferValidation,
  handleValidationErrors,
  transferFunds
);

/**
 * @swagger
 * /transactions/transfer-by-account:
 *   post:
 *     summary: Transfer funds using account number
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fromAccountId
 *               - toAccountNumber
 *               - amount
 *             properties:
 *               fromAccountId:
 *                 type: string
 *                 description: Source account ID
 *               toAccountNumber:
 *                 type: string
 *                 description: Destination account number
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *                 description: Transfer amount
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: Optional transaction description
 *     responses:
 *       200:
 *         description: Transfer completed successfully
 *       400:
 *         description: Bad request - validation errors
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Account not found
 *       500:
 *         description: Server error
 */
TransactionRouter.post(
  "/transfer-by-account",
  Authenticated,
  transferByAccountNumberValidation,
  handleValidationErrors,
  transferByAccountNumber
);

/**
 * @swagger
 * /transactions/balance/{accountId}:
 *   get:
 *     summary: Get account balance and recent transactions
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *         description: Account ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of recent transactions to retrieve
 *     responses:
 *       200:
 *         description: Account balance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 statusCode:
 *                   type: number
 *                 data:
 *                   type: object
 *                   properties:
 *                     account:
 *                       type: object
 *                       properties:
 *                         accountNumber:
 *                           type: string
 *                         accountType:
 *                           type: string
 *                         balance:
 *                           type: number
 *                         currency:
 *                           type: string
 *                         status:
 *                           type: string
 *                     recentTransactions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Transaction'
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Account not found
 *       500:
 *         description: Server error
 */
TransactionRouter.get(
  "/balance/:accountId",
  Authenticated,
  param("accountId").isMongoId().withMessage("Invalid account ID format"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),
  handleValidationErrors,
  getAccountBalance
);

export default TransactionRouter;
