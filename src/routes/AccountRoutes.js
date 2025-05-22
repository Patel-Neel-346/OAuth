import express from "express";
import {
  CreateAccount,
  getAllAccount,
  getUserAccount,
  UpdateUserAccount,
  CloseUserAccount,
} from "../controller/AccountController.js";
import { Authenticated } from "../middleware/authMiddleware.js";
import { body, param, query, validationResult } from "express-validator";
import { ApiError } from "../helpers/ApiError.js";

const AccountRoute = express.Router();

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

// Validation rules for account creation
const createAccountValidation = [
  body("accountType")
    .isIn(["savings", "checking", "loan", "credit", "investment"])
    .withMessage(
      "Invalid account type. Must be one of: savings, checking, loan, credit, investment"
    ),
  body("initialDeposit")
    .optional()
    .isNumeric()
    .withMessage("Initial deposit must be a number")
    .isFloat({ min: 0 })
    .withMessage("Initial deposit cannot be negative"),
  body("currency")
    .optional()
    .isLength({ min: 1, max: 5 })
    .withMessage("Currency must be 1-5 characters"),
];

// Validation rules for account updates
const updateAccountValidation = [
  param("accountId").isMongoId().withMessage("Invalid account ID format"),
  body("status")
    .optional()
    .isIn(["active", "inactive", "suspended"])
    .withMessage("Status must be one of: active, inactive, suspended"),
  body("interestRate")
    .optional()
    .isNumeric()
    .withMessage("Interest rate must be a number")
    .isFloat({ min: 0, max: 100 })
    .withMessage("Interest rate must be between 0 and 100"),
];

// Validation rules for account closure
const closeAccountValidation = [
  param("accountId").isMongoId().withMessage("Invalid account ID format"),
  body("transferAccountId")
    .optional()
    .isMongoId()
    .withMessage("Invalid transfer account ID format"),
  body("reason")
    .optional()
    .isLength({ min: 1, max: 500 })
    .withMessage("Reason must be between 1 and 500 characters"),
];

// Query validation for getting accounts
const getAccountsValidation = [
  query("status")
    .optional()
    .isIn(["active", "inactive", "suspended", "closed"])
    .withMessage("Invalid status filter"),
  query("accountType")
    .optional()
    .isIn(["savings", "checking", "loan", "credit", "investment"])
    .withMessage("Invalid account type filter"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];

/**
 * @swagger
 * components:
 *   schemas:
 *     Account:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Account ID
 *         userId:
 *           type: string
 *           description: Owner user ID
 *         accountNumber:
 *           type: string
 *           description: Unique account number
 *         accountType:
 *           type: string
 *           enum: [savings, checking, loan, credit, investment]
 *           description: Type of account
 *         balance:
 *           type: number
 *           description: Current account balance
 *         currency:
 *           type: string
 *           description: Account currency
 *         status:
 *           type: string
 *           enum: [active, inactive, suspended, closed]
 *           description: Account status
 *         interestRate:
 *           type: number
 *           description: Interest rate for the account
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateAccountRequest:
 *       type: object
 *       required:
 *         - accountType
 *       properties:
 *         accountType:
 *           type: string
 *           enum: [savings, checking, loan, credit, investment]
 *           description: Type of account to create
 *         initialDeposit:
 *           type: number
 *           minimum: 0
 *           description: Initial deposit amount (default: 0)
 *         currency:
 *           type: string
 *           description: Account currency (default: ₹)
 */

/**
 * @swagger
 * /accounts:
 *   post:
 *     summary: Create a new account
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAccountRequest'
 *     responses:
 *       201:
 *         description: Account created successfully
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
 *                       $ref: '#/components/schemas/Account'
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request - validation errors or insufficient permissions
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - user role doesn't allow this account type
 *       500:
 *         description: Server error
 */
AccountRoute.post(
  "/",
  Authenticated,
  createAccountValidation,
  handleValidationErrors,
  CreateAccount
);

/**
 * @swagger
 * /accounts:
 *   get:
 *     summary: Get all accounts for authenticated user
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, suspended, closed]
 *         description: Filter by account status
 *       - in: query
 *         name: accountType
 *         schema:
 *           type: string
 *           enum: [savings, checking, loan, credit, investment]
 *         description: Filter by account type
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of accounts per page
 *     responses:
 *       200:
 *         description: Accounts retrieved successfully
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
 *                     accounts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Account'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: number
 *                         totalPages:
 *                           type: number
 *                         totalAccounts:
 *                           type: number
 *                         hasNextPage:
 *                           type: boolean
 *                         hasPrevPage:
 *                           type: boolean
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalBalance:
 *                           type: number
 *                         accountCount:
 *                           type: number
 *                         currency:
 *                           type: string
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
AccountRoute.get(
  "/",
  Authenticated,
  getAccountsValidation,
  handleValidationErrors,
  getAllAccount
);

/**
 * @swagger
 * /accounts/{accountId}:
 *   get:
 *     summary: Get specific account details
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *         description: Account ID
 *     responses:
 *       200:
 *         description: Account details retrieved successfully
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
 *                       $ref: '#/components/schemas/Account'
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Account not found or access denied
 *       500:
 *         description: Server error
 */
AccountRoute.get(
  "/:accountId",
  Authenticated,
  param("accountId").isMongoId().withMessage("Invalid account ID format"),
  handleValidationErrors,
  getUserAccount
);

/**
 * @swagger
 * /accounts/{accountId}:
 *   put:
 *     summary: Update account information
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *         description: Account ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, inactive, suspended]
 *                 description: Account status (admins can change)
 *               interestRate:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Interest rate (admin only)
 *     responses:
 *       200:
 *         description: Account updated successfully
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
 *                       $ref: '#/components/schemas/Account'
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request - no valid fields to update
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Account not found or access denied
 *       500:
 *         description: Server error
 */
AccountRoute.put(
  "/:accountId",
  Authenticated,
  updateAccountValidation,
  handleValidationErrors,
  UpdateUserAccount
);

/**
 * @swagger
 * /accounts/{accountId}/close:
 *   post:
 *     summary: Close/deactivate account
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *         description: Account ID to close
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 maxLength: 500
 *                 description: Reason for closing account
 *               transferAccountId:
 *                 type: string
 *                 description: Account ID to transfer remaining balance (required if balance > 0)
 *     responses:
 *       200:
 *         description: Account closed successfully
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
 *                     closedAccount:
 *                       type: object
 *                       properties:
 *                         accountNumber:
 *                           type: string
 *                         accountType:
 *                           type: string
 *                         finalBalance:
 *                           type: number
 *                         closedAt:
 *                           type: string
 *                         reason:
 *                           type: string
 *                     transferDetails:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         transferredTo:
 *                           type: string
 *                         amount:
 *                           type: number
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request - account already closed or balance transfer required
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Account not found or access denied
 *       500:
 *         description: Server error
 */
AccountRoute.post(
  "/:accountId/close",
  Authenticated,
  closeAccountValidation,
  handleValidationErrors,
  CloseUserAccount
);

/**
 * @swagger
 * /accounts/types:
 *   get:
 *     summary: Get available account types for current user
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Available account types retrieved successfully
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
 *                     availableTypes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                           description:
 *                             type: string
 *                           minDeposit:
 *                             type: number
 *                           interestRate:
 *                             type: number
 *                           requirements:
 *                             type: array
 *                             items:
 *                               type: string
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
AccountRoute.get("/types", Authenticated, async (req, res, next) => {
  try {
    const userId = req.user;
    const userProfile = await RoleUserService.getUserCompleteProfile(userId);

    const accountTypes = [
      {
        type: "savings",
        description: "Standard savings account with interest",
        minDeposit: 100,
        interestRate: 3.5,
        requirements: ["Available to all users"],
        available: true,
      },
      {
        type: "loan",
        description: "Loan account for borrowing funds",
        minDeposit: 0,
        interestRate: 8.5,
        requirements: ["Must have BORROWER role"],
        available: userProfile.roles.includes(ROLE_TYPES.BORROWER),
      },
      {
        type: "credit",
        description: "Credit account with revolving credit line",
        minDeposit: 0,
        interestRate: 18.0,
        requirements: ["Must have BORROWER or LENDER role"],
        available:
          userProfile.roles.includes(ROLE_TYPES.BORROWER) ||
          userProfile.roles.includes(ROLE_TYPES.LENDER),
      },
      {
        type: "investment",
        description: "Investment account for portfolio management",
        minDeposit: 1000,
        interestRate: 5.0,
        requirements: ["Must have LENDER role or ADMIN role"],
        available:
          userProfile.roles.includes(ROLE_TYPES.LENDER) ||
          userProfile.roles.includes(ROLE_TYPES.ADMIN),
      },
    ];

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: {
        availableTypes: accountTypes.filter((type) => type.available),
        allTypes: accountTypes,
        userRoles: userProfile.roles,
      },
      message: "Account types retrieved successfully",
    });
  } catch (error) {
    console.error("Get account types error:", error);
    return next(new ApiError(500, "Failed to retrieve account types"));
  }
});

export default AccountRoute;
