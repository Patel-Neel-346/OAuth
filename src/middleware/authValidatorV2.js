// src/middleware/validationMiddleware.js - Account validation middleware
import { body, param, validationResult } from "express-validator";
import { ApiError } from "../helpers/ApiError.js";

// Helper function to handle validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = {};
    errors.array().forEach((error) => {
      formattedErrors[error.path] = error.msg;
    });

    const apiError = new ApiError(400, "Validation failed");
    apiError.errors = errors.array();
    return next(apiError);
  }
  next();
};

// Account creation validation
export const validateAccountCreation = [
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
    .withMessage("Initial deposit must be non-negative"),

  body("currency")
    .optional()
    .isLength({ min: 1, max: 3 })
    .withMessage("Currency must be 1-3 characters"),

  handleValidationErrors,
];

// Account update validation
export const validateAccountUpdate = [
  param("accountId").isMongoId().withMessage("Invalid account ID format"),

  body("status")
    .optional()
    .isIn(["active", "inactive", "suspended", "closed"])
    .withMessage(
      "Invalid status. Must be one of: active, inactive, suspended, closed"
    ),

  body("interestRate")
    .optional()
    .isNumeric()
    .withMessage("Interest rate must be a number")
    .isFloat({ min: 0, max: 25 })
    .withMessage("Interest rate must be between 0 and 25"),

  body("balance")
    .optional()
    .isNumeric()
    .withMessage("Balance must be a number"),

  handleValidationErrors,
];

// Account closure validation
export const validateAccountClosure = [
  param("accountId").isMongoId().withMessage("Invalid account ID format"),

  body("reason")
    .optional()
    .isLength({ min: 3, max: 200 })
    .withMessage("Reason must be between 3 and 200 characters"),

  body("transferAccountId")
    .optional()
    .isMongoId()
    .withMessage("Invalid transfer account ID format"),

  handleValidationErrors,
];

// Account ID parameter validation
export const validateAccountId = [
  param("accountId").isMongoId().withMessage("Invalid account ID format"),

  handleValidationErrors,
];

// Query parameter validation for account listing
export const validateAccountQuery = [
  body("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  body("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  body("status")
    .optional()
    .isIn(["active", "inactive", "suspended", "closed"])
    .withMessage("Invalid status filter"),

  body("accountType")
    .optional()
    .isIn(["savings", "checking", "loan", "credit", "investment"])
    .withMessage("Invalid account type filter"),

  handleValidationErrors,
];
