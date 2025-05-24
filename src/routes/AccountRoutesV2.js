// src/routes/AccountRoutes.js - Enhanced with role-based access control
import express from "express";
import {
  CreateAccount,
  getAllAccount,
  getUserAccount,
  UpdateUserAccount,
  CloseUserAccount,
} from "../controller/AccountController.js";
import { Authenticated } from "../middleware/authMiddleware.js";
import { hasRole } from "../middleware/roleMiddleware.js";
import { ROLE_TYPES } from "../models/Role.js";
import {
  validateAccountCreation,
  validateAccountUpdate,
} from "../middleware/validationMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(Authenticated);

/**
 * @route   POST /accounts
 * @desc    Create a new account
 * @access  Private (All authenticated users can create basic accounts)
 * @note    Role-based restrictions handled in controller logic
 */
router.post("/", validateAccountCreation, CreateAccount);

/**
 * @route   GET /accounts
 * @desc    Get all accounts for user (or all accounts for admin)
 * @access  Private (Users see their own, Admins see all)
 */
router.get("/", getAllAccount);

/**
 * @route   GET /accounts/admin/all
 * @desc    Get all system accounts (Admin only)
 * @access  Private (Admin and Manager only)
 */
router.get(
  "/admin/all",
  hasRole([ROLE_TYPES.ADMIN, ROLE_TYPES.MANAGER]),
  getAllAccount
);

/**
 * @route   GET /accounts/:accountId
 * @desc    Get specific account details
 * @access  Private (Owner or Admin/Manager)
 */
router.get("/:accountId", getUserAccount);

/**
 * @route   PUT /accounts/:accountId
 * @desc    Update account information
 * @access  Private (Role-based field restrictions)
 */
router.put("/:accountId", validateAccountUpdate, UpdateUserAccount);

/**
 * @route   PUT /accounts/:accountId/status
 * @desc    Update account status (Admin/Manager only)
 * @access  Private (Admin and Manager only)
 */
router.put(
  "/:accountId/status",
  hasRole([ROLE_TYPES.ADMIN, ROLE_TYPES.MANAGER]),
  validateAccountUpdate,
  UpdateUserAccount
);

/**
 * @route   PUT /accounts/:accountId/interest-rate
 * @desc    Update account interest rate (Admin only)
 * @access  Private (Admin only)
 */
router.put(
  "/:accountId/interest-rate",
  hasRole([ROLE_TYPES.ADMIN]),
  validateAccountUpdate,
  UpdateUserAccount
);

/**
 * @route   DELETE /accounts/:accountId
 * @desc    Close/deactivate account
 * @access  Private (Owner or Admin)
 */
router.delete("/:accountId", CloseUserAccount);

/**
 * @route   POST /accounts/loan
 * @desc    Create loan account (Borrowers only)
 * @access  Private (Borrower role required)
 */
router.post(
  "/loan",
  hasRole([ROLE_TYPES.BORROWER, ROLE_TYPES.ADMIN]),
  validateAccountCreation,
  (req, res, next) => {
    req.body.accountType = "loan";
    next();
  },
  CreateAccount
);

/**
 * @route   POST /accounts/investment
 * @desc    Create investment account (Lenders only)
 * @access  Private (Lender role required)
 */
router.post(
  "/investment",
  hasRole([ROLE_TYPES.LENDER, ROLE_TYPES.ADMIN]),
  validateAccountCreation,
  (req, res, next) => {
    req.body.accountType = "investment";
    next();
  },
  CreateAccount
);

/**
 * @route   POST /accounts/credit
 * @desc    Create credit account (Borrowers and Lenders)
 * @access  Private (Borrower or Lender role required)
 */
router.post(
  "/credit",
  hasRole([ROLE_TYPES.BORROWER, ROLE_TYPES.LENDER, ROLE_TYPES.ADMIN]),
  validateAccountCreation,
  (req, res, next) => {
    req.body.accountType = "credit";
    next();
  },
  CreateAccount
);

/**
 * @route   GET /accounts/type/:accountType
 * @desc    Get accounts by type
 * @access  Private (Role-based filtering applied)
 */
router.get(
  "/type/:accountType",
  (req, res, next) => {
    req.query.accountType = req.params.accountType;
    next();
  },
  getAllAccount
);

/**
 * @route   GET /accounts/status/:status
 * @desc    Get accounts by status
 * @access  Private (Role-based filtering applied)
 */
router.get(
  "/status/:status",
  (req, res, next) => {
    req.query.status = req.params.status;
    next();
  },
  getAllAccount
);

export default router;
