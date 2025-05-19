import { body, validationResult } from "express-validator";
import { ApiError } from "../helpers/ApiError.js";

// Middleware to check validation results
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ApiError(400, "Validation Error", errors.array()));
  }
  next();
};

// Validation rules for user registration
export const registerValidationRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters long")
    .isLength({ max: 50 })
    .withMessage("Name cannot exceed 50 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .isLength({ max: 50 })
    .withMessage("Password cannot exceed 50 characters")
    .matches(/\d/)
    .withMessage("Password must contain at least one number")
    .matches(/[a-zA-Z]/)
    .withMessage("Password must contain at least one letter"),

  validateRequest,
];

// Validation rules for user login
export const loginValidationRules = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),

  validateRequest,
];

// // src/middleware/validation.js
// import { body, param, query, validationResult } from "express-validator";
// import { ApiError } from "../helpers/ApiError.js";
// import mongoose from "mongoose";

// // Middleware to check validation results
// export const validateRequest = (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     // Format errors for better readability
//     const formattedErrors = errors.array().map((error) => ({
//       field: error.path,
//       message: error.msg,
//       value: error.value,
//     }));

//     return next(new ApiError(400, "Validation Error", formattedErrors));
//   }
//   next();
// };

// // Custom validator for ObjectId
// const isValidObjectId = (value) => {
//   return mongoose.Types.ObjectId.isValid(value);
// };

// // Authentication Validation Rules
// export const registerValidationRules = [
//   body("name")
//     .trim()
//     .notEmpty()
//     .withMessage("Name is required")
//     .isLength({ min: 2, max: 50 })
//     .withMessage("Name must be between 2 and 50 characters")
//     .matches(/^[a-zA-Z\s]+$/)
//     .withMessage("Name can only contain letters and spaces"),

//   body("email")
//     .trim()
//     .notEmpty()
//     .withMessage("Email is required")
//     .isEmail()
//     .withMessage("Please provide a valid email address")
//     .normalizeEmail()
//     .isLength({ max: 100 })
//     .withMessage("Email cannot exceed 100 characters"),

//   body("password")
//     .notEmpty()
//     .withMessage("Password is required")
//     .isLength({ min: 8, max: 128 })
//     .withMessage("Password must be between 8 and 128 characters")
//     .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
//     .withMessage(
//       "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
//     ),

//   validateRequest,
// ];

// export const loginValidationRules = [
//   body("email")
//     .trim()
//     .notEmpty()
//     .withMessage("Email is required")
//     .isEmail()
//     .withMessage("Please provide a valid email address")
//     .normalizeEmail(),

//   body("password").notEmpty().withMessage("Password is required"),

//   validateRequest,
// ];

// // Client Data Validation Rules
// export const getClientDataValidationRules = [
//   query("page")
//     .optional()
//     .isInt({ min: 1 })
//     .withMessage("Page must be a positive integer")
//     .toInt(),

//   query("limit")
//     .optional()
//     .isInt({ min: 1, max: 100 })
//     .withMessage("Limit must be between 1 and 100")
//     .toInt(),

//   query("sortBy")
//     .optional()
//     .isString()
//     .isIn([
//       "age",
//       "job",
//       "marital",
//       "education",
//       "balance",
//       "housing",
//       "loan",
//       "Target",
//       "importedAt",
//     ])
//     .withMessage("Invalid sort field"),

//   query("sortOrder")
//     .optional()
//     .isIn(["asc", "desc"])
//     .withMessage("Sort order must be 'asc' or 'desc'"),

//   validateRequest,
// ];

// export const getClientByIdValidationRules = [
//   param("id")
//     .notEmpty()
//     .withMessage("Client ID is required")
//     .custom(isValidObjectId)
//     .withMessage("Invalid client ID format"),

//   validateRequest,
// ];

// export const filterClientDataValidationRules = [
//   query("page")
//     .optional()
//     .isInt({ min: 1 })
//     .withMessage("Page must be a positive integer")
//     .toInt(),

//   query("limit")
//     .optional()
//     .isInt({ min: 1, max: 100 })
//     .withMessage("Limit must be between 1 and 100")
//     .toInt(),

//   // Validate common filter fields
//   body("age")
//     .optional()
//     .custom((value) => {
//       if (typeof value === "object") {
//         if (
//           value.min !== undefined &&
//           (!Number.isInteger(value.min) || value.min < 0)
//         ) {
//           throw new Error("Age minimum must be a non-negative integer");
//         }
//         if (
//           value.max !== undefined &&
//           (!Number.isInteger(value.max) || value.max < 0)
//         ) {
//           throw new Error("Age maximum must be a non-negative integer");
//         }
//         if (
//           value.min !== undefined &&
//           value.max !== undefined &&
//           value.min > value.max
//         ) {
//           throw new Error("Age minimum cannot be greater than maximum");
//         }
//       } else if (!Number.isInteger(value) || value < 0) {
//         throw new Error("Age must be a non-negative integer");
//       }
//       return true;
//     }),

//   body("job")
//     .optional()
//     .custom((value) => {
//       if (Array.isArray(value)) {
//         if (
//           !value.every(
//             (item) => typeof item === "string" && item.trim().length > 0
//           )
//         ) {
//           throw new Error("All job values must be non-empty strings");
//         }
//       } else if (typeof value !== "string" || value.trim().length === 0) {
//         throw new Error("Job must be a non-empty string");
//       }
//       return true;
//     }),

//   body("marital")
//     .optional()
//     .custom((value) => {
//       const validValues = ["single", "married", "divorced"];
//       if (Array.isArray(value)) {
//         if (!value.every((item) => validValues.includes(item))) {
//           throw new Error("Invalid marital status values");
//         }
//       } else if (!validValues.includes(value)) {
//         throw new Error("Marital status must be single, married, or divorced");
//       }
//       return true;
//     }),

//   body("education")
//     .optional()
//     .custom((value) => {
//       if (Array.isArray(value)) {
//         if (
//           !value.every(
//             (item) => typeof item === "string" && item.trim().length > 0
//           )
//         ) {
//           throw new Error("All education values must be non-empty strings");
//         }
//       } else if (typeof value !== "string" || value.trim().length === 0) {
//         throw new Error("Education must be a non-empty string");
//       }
//       return true;
//     }),

//   body("balance")
//     .optional()
//     .custom((value) => {
//       if (typeof value === "object") {
//         if (value.min !== undefined && typeof value.min !== "number") {
//           throw new Error("Balance minimum must be a number");
//         }
//         if (value.max !== undefined && typeof value.max !== "number") {
//           throw new Error("Balance maximum must be a number");
//         }
//         if (
//           value.min !== undefined &&
//           value.max !== undefined &&
//           value.min > value.max
//         ) {
//           throw new Error("Balance minimum cannot be greater than maximum");
//         }
//       } else if (typeof value !== "number") {
//         throw new Error("Balance must be a number");
//       }
//       return true;
//     }),

//   body("housing")
//     .optional()
//     .custom((value) => {
//       const validValues = ["yes", "no"];
//       if (Array.isArray(value)) {
//         if (!value.every((item) => validValues.includes(item))) {
//           throw new Error("Housing values must be yes or no");
//         }
//       } else if (!validValues.includes(value)) {
//         throw new Error("Housing must be yes or no");
//       }
//       return true;
//     }),

//   body("loan")
//     .optional()
//     .custom((value) => {
//       const validValues = ["yes", "no"];
//       if (Array.isArray(value)) {
//         if (!value.every((item) => validValues.includes(item))) {
//           throw new Error("Loan values must be yes or no");
//         }
//       } else if (!validValues.includes(value)) {
//         throw new Error("Loan must be yes or no");
//       }
//       return true;
//     }),

//   body("Target")
//     .optional()
//     .custom((value) => {
//       const validValues = ["yes", "no"];
//       if (Array.isArray(value)) {
//         if (!value.every((item) => validValues.includes(item))) {
//           throw new Error("Target values must be yes or no");
//         }
//       } else if (!validValues.includes(value)) {
//         throw new Error("Target must be yes or no");
//       }
//       return true;
//     }),

//   validateRequest,
// ];

// // CSV Upload Validation
// export const csvUploadValidationRules = [
//   // File validation is handled by multer middleware
//   // This is just for additional request validation if needed

//   validateRequest,
// ];

// // Data Statistics Validation
// export const dataStatsValidationRules = [
//   // No specific validation needed for stats endpoint
//   validateRequest,
// ];

// // General validation helpers
// export const paginationValidationRules = [
//   query("page")
//     .optional()
//     .isInt({ min: 1 })
//     .withMessage("Page must be a positive integer")
//     .toInt(),

//   query("limit")
//     .optional()
//     .isInt({ min: 1, max: 100 })
//     .withMessage("Limit must be between 1 and 100")
//     .toInt(),
// ];

// export const sortingValidationRules = [
//   query("sortBy")
//     .optional()
//     .isString()
//     .withMessage("Sort field must be a string"),

//   query("sortOrder")
//     .optional()
//     .isIn(["asc", "desc"])
//     .withMessage("Sort order must be 'asc' or 'desc'"),
// ];

// // Combine pagination and sorting validation
// export const paginationAndSortingValidationRules = [
//   ...paginationValidationRules,
//   ...sortingValidationRules,
//   validateRequest,
// ];

// // Request body size validation middleware
// export const validateRequestSize = (maxSize = "10mb") => {
//   return (req, res, next) => {
//     const contentLength = req.get("Content-Length");
//     if (
//       contentLength &&
//       parseInt(contentLength) > parseInt(maxSize) * 1024 * 1024
//     ) {
//       return next(
//         new ApiError(400, `Request body too large. Maximum size is ${maxSize}`)
//       );
//     }
//     next();
//   };
// };

// // File validation middleware (for use with multer)
// export const validateFileUpload = (req, res, next) => {
//   if (!req.file) {
//     return next(new ApiError(400, "No file uploaded"));
//   }

//   // Additional file validations
//   const allowedMimeTypes = ["text/csv", "application/csv"];
//   if (
//     !allowedMimeTypes.includes(req.file.mimetype) &&
//     !req.file.originalname.endsWith(".csv")
//   ) {
//     return next(new ApiError(400, "Only CSV files are allowed"));
//   }

//   // Check file size (10MB limit)
//   const maxSize = 10 * 1024 * 1024; // 10MB
//   if (req.file.size > maxSize) {
//     return next(new ApiError(400, "File size too large. Maximum size is 10MB"));
//   }

//   next();
// };

// // Sanitization middleware
// export const sanitizeInput = (req, res, next) => {
//   // Recursively sanitize all string inputs
//   const sanitize = (obj) => {
//     for (const key in obj) {
//       if (typeof obj[key] === "string") {
//         // Basic XSS protection - remove script tags and javascript: protocols
//         obj[key] = obj[key]
//           .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
//           .replace(/javascript:/gi, "")
//           .trim();
//       } else if (typeof obj[key] === "object" && obj[key] !== null) {
//         sanitize(obj[key]);
//       }
//     }
//   };

//   if (req.body) sanitize(req.body);
//   if (req.query) sanitize(req.query);
//   if (req.params) sanitize(req.params);

//   next();
// };

// // Rate limiting validation helper
// export const createRateLimitMessage = (windowMs, max) => {
//   return `Too many requests from this IP, please try again after ${
//     windowMs / 1000
//   } seconds. Limit: ${max} requests per window.`;
// };
