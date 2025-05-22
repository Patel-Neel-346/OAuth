import express from "express";
import {
  SignUp,
  Login,
  RefreshToken,
  Logout,
  GetUserProfile,
  AuthSuccess,
  GoogleCallback,
  FacebookCallback,
} from "../controller/authController.js";
import {
  Authenticated,
  googleAuth,
  googleAuthCallback,
  facebookAuth,
  facebookAuthCallback,
} from "../middleware/authMiddleware.js";
import { hasRole } from "../middleware/roleMiddleware.js";
import { ROLE_TYPES } from "../models/Role.js";
// Import Role Router for role-based endpoints
// import RoleRouter from "./roleRoutes.js";
import {
  loginValidationRules,
  registerValidationRules,
} from "../middleware/authValidator.js";

const AuthRouter = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user with optional role
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *               role:
 *                 type: string
 *                 enum: [USER, ADMIN, MANAGER, BORROWER, LENDER]
 *                 description: Role to assign to the user (defaults to USER if not specified)
 *               monthlyIncome:
 *                 type: number
 *                 description: Required for BORROWER role - Monthly income amount
 *               employmentStatus:
 *                 type: string
 *                 enum: [employed, self-employed, unemployed, retired, student]
 *                 description: Required for BORROWER role - Current employment status
 *               lendingCapacity:
 *                 type: number
 *                 description: Required for LENDER role - Maximum lending capacity
 *               interestRatePersonal:
 *                 type: number
 *                 description: Required for LENDER role - Base interest rate for personal loans
 *     responses:
 *       201:
 *         description: User registered successfully with role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Bad request - user already exists, missing fields, or invalid role data
 *       500:
 *         description: Server error
 */
AuthRouter.post("/register", registerValidationRules, SignUp);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user and retrieve role information
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
AuthRouter.post("/login", loginValidationRules, Login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log out a user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized - not logged in
 *       500:
 *         description: Server error
 */
AuthRouter.post("/logout", Authenticated, Logout);

/**
 * @swagger
 * /auth/refresh-token:
 *   get:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     parameters:
 *       - in: cookie
 *         name: refreshToken
 *         schema:
 *           type: string
 *         required: true
 *         description: Refresh token in cookie
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Invalid refresh token
 *       500:
 *         description: Server error
 */
AuthRouter.get("/refresh-token", RefreshToken);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get user profile with role information
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized - not logged in
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
AuthRouter.get("/profile", Authenticated, GetUserProfile);

// /**
//  * @swagger
//  * /auth/google:
//  *   get:
//  *     summary: Authenticate with Google
//  *     tags: [OAuth]
//  *     description: Redirects to Google OAuth login page
//  *     responses:
//  *       302:
//  *         description: Redirect to Google authentication
//  */
// AuthRouter.get("/google", googleAuth);

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     tags: [OAuth]
 *     description: Callback endpoint for Google OAuth
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: OAuth authorization code
 *     responses:
 *       302:
 *         description: Redirects to success endpoint with token
 */
AuthRouter.get("/google/callback", googleAuthCallback, GoogleCallback);

// /**
//  * @swagger
//  * /auth/facebook:
//  *   get:
//  *     summary: Authenticate with Facebook
//  *     tags: [OAuth]
//  *     description: Redirects to Facebook OAuth login page
//  *     responses:
//  *       302:
//  *         description: Redirect to Facebook authentication
//  */
// AuthRouter.get("/facebook", facebookAuth);

/**
 * @swagger
 * /auth/facebook/callback:
 *   get:
 *     summary: Facebook OAuth callback
 *     tags: [OAuth]
 *     description: Callback endpoint for Facebook OAuth
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: OAuth authorization code
 *     responses:
 *       302:
 *         description: Redirects to success endpoint with token
 */
AuthRouter.get("/facebook/callback", facebookAuthCallback, FacebookCallback);

/**
 * @swagger
 * /auth/success:
 *   get:
 *     summary: OAuth success redirect
 *     tags: [OAuth]
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         description: Authentication token
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
AuthRouter.get("/success", AuthSuccess);

/**
 * @swagger
 * /auth/role:
 *   post:
 *     summary: Add a role to a user
 *     tags: [User, Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [USER, ADMIN, MANAGER, BORROWER, LENDER]
 *               monthlyIncome:
 *                 type: number
 *                 description: Required for BORROWER role
 *               employmentStatus:
 *                 type: string
 *                 enum: [employed, self-employed, unemployed, retired, student]
 *                 description: Required for BORROWER role
 *               lendingCapacity:
 *                 type: number
 *                 description: Required for LENDER role
 *               interestRatePersonal:
 *                 type: number
 *                 description: Required for LENDER role
 *     responses:
 *       200:
 *         description: Role successfully added to user
 *       400:
 *         description: Bad request - invalid role or missing required profile data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
AuthRouter.post("/role", Authenticated, async (req, res, next) => {
  try {
    const { role, ...profileData } = req.body;

    if (!role || !Object.values(ROLE_TYPES).includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role specified",
      });
    }

    // Use the RoleUserService to assign the role
    const result = await RoleUserService.assignRoleToUser(
      req.user,
      role,
      profileData
    );

    res.status(200).json({
      success: true,
      message: `${role} role added successfully`,
      data: { role: result.role },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /auth/role/{roleName}:
 *   delete:
 *     summary: Remove a role from a user
 *     tags: [User, Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleName
 *         required: true
 *         schema:
 *           type: string
 *           enum: [ADMIN, MANAGER, BORROWER, LENDER]
 *         description: Role to remove (cannot remove USER role)
 *     responses:
 *       200:
 *         description: Role successfully removed from user
 *       400:
 *         description: Bad request - cannot remove USER role or user doesn't have role
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
AuthRouter.delete("/role/:roleName", Authenticated, async (req, res, next) => {
  try {
    const { roleName } = req.params;

    // Cannot remove USER role
    if (roleName === ROLE_TYPES.USER) {
      return res.status(400).json({
        success: false,
        message: "Cannot remove the USER role",
      });
    }

    if (!Object.values(ROLE_TYPES).includes(roleName)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role specified",
      });
    }

    // Use the RoleUserService to remove the role
    await RoleUserService.removeRoleFromUser(req.user, roleName);

    res.status(200).json({
      success: true,
      message: `${roleName} role removed successfully`,
    });
  } catch (error) {
    next(error);
  }
});

// Mount the Role Router for admin-only role management
// AuthRouter.use(
//   "/admin/roles",
//   Authenticated,
//   hasRole(ROLE_TYPES.ADMIN),
//   RoleRouter
// );

// Updated sections for src/routes/authRoutes.js

// Add these new route definitions to your existing authRoutes.js file

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Authenticate with Google (with optional role)
 *     tags: [OAuth]
 *     description: Redirects to Google OAuth login page with optional role selection
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [BORROWER, LENDER, USER]
 *         description: Role to assign after successful authentication
 *       - in: query
 *         name: monthlyIncome
 *         schema:
 *           type: number
 *         description: Required for BORROWER role - Monthly income amount
 *       - in: query
 *         name: employmentStatus
 *         schema:
 *           type: string
 *           enum: [employed, self-employed, unemployed, retired, student]
 *         description: Required for BORROWER role - Employment status
 *       - in: query
 *         name: lendingCapacity
 *         schema:
 *           type: number
 *         description: Required for LENDER role - Maximum lending capacity
 *       - in: query
 *         name: interestRatePersonal
 *         schema:
 *           type: number
 *         description: Required for LENDER role - Base interest rate for personal loans
 *     responses:
 *       302:
 *         description: Redirect to Google authentication
 */
AuthRouter.get("/google", googleAuth);

/**
 * @swagger
 * /auth/facebook:
 *   get:
 *     summary: Authenticate with Facebook (with optional role)
 *     tags: [OAuth]
 *     description: Redirects to Facebook OAuth login page with optional role selection
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [BORROWER, LENDER, USER]
 *         description: Role to assign after successful authentication
 *       - in: query
 *         name: monthlyIncome
 *         schema:
 *           type: number
 *         description: Required for BORROWER role - Monthly income amount
 *       - in: query
 *         name: employmentStatus
 *         schema:
 *           type: string
 *           enum: [employed, self-employed, unemployed, retired, student]
 *         description: Required for BORROWER role - Employment status
 *       - in: query
 *         name: lendingCapacity
 *         schema:
 *           type: number
 *         description: Required for LENDER role - Maximum lending capacity
 *       - in: query
 *         name: interestRatePersonal
 *         schema:
 *           type: number
 *         description: Required for LENDER role - Base interest rate for personal loans
 *     responses:
 *       302:
 *         description: Redirect to Facebook authentication
 */
AuthRouter.get("/facebook", facebookAuth);

// Add these additional utility routes for role-based OAuth

/**
 * @swagger
 * /auth/google/borrower:
 *   post:
 *     summary: Register as borrower via Google OAuth
 *     tags: [OAuth, Roles]
 *     description: Redirects to Google OAuth with borrower role pre-selected
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - monthlyIncome
 *               - employmentStatus
 *             properties:
 *               monthlyIncome:
 *                 type: number
 *                 description: Monthly income amount
 *               employmentStatus:
 *                 type: string
 *                 enum: [employed, self-employed, unemployed, retired, student]
 *                 description: Current employment status
 *     responses:
 *       302:
 *         description: Redirect to Google authentication with borrower role
 */
AuthRouter.post("/google/borrower", (req, res) => {
  const { monthlyIncome, employmentStatus } = req.body;

  if (!monthlyIncome || !employmentStatus) {
    return res.status(400).json({
      success: false,
      message:
        "Monthly income and employment status are required for borrower registration",
    });
  }

  const params = new URLSearchParams({
    role: ROLE_TYPES.BORROWER,
    monthlyIncome: monthlyIncome.toString(),
    employmentStatus,
  });

  res.redirect(`/auth/google?${params.toString()}`);
});

/**
 * @swagger
 * /auth/google/lender:
 *   post:
 *     summary: Register as lender via Google OAuth
 *     tags: [OAuth, Roles]
 *     description: Redirects to Google OAuth with lender role pre-selected
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lendingCapacity
 *               - interestRatePersonal
 *             properties:
 *               lendingCapacity:
 *                 type: number
 *                 description: Maximum lending capacity
 *               interestRatePersonal:
 *                 type: number
 *                 description: Base interest rate for personal loans
 *     responses:
 *       302:
 *         description: Redirect to Google authentication with lender role
 */
AuthRouter.post("/google/lender", (req, res) => {
  const { lendingCapacity, interestRatePersonal } = req.body;

  if (!lendingCapacity || !interestRatePersonal) {
    return res.status(400).json({
      success: false,
      message:
        "Lending capacity and interest rate are required for lender registration",
    });
  }

  const params = new URLSearchParams({
    role: ROLE_TYPES.LENDER,
    lendingCapacity: lendingCapacity.toString(),
    interestRatePersonal: interestRatePersonal.toString(),
  });

  res.redirect(`/auth/google?${params.toString()}`);
});

/**
 * @swagger
 * /auth/facebook/borrower:
 *   post:
 *     summary: Register as borrower via Facebook OAuth
 *     tags: [OAuth, Roles]
 *     description: Redirects to Facebook OAuth with borrower role pre-selected
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - monthlyIncome
 *               - employmentStatus
 *             properties:
 *               monthlyIncome:
 *                 type: number
 *                 description: Monthly income amount
 *               employmentStatus:
 *                 type: string
 *                 enum: [employed, self-employed, unemployed, retired, student]
 *                 description: Current employment status
 *     responses:
 *       302:
 *         description: Redirect to Facebook authentication with borrower role
 */
AuthRouter.post("/facebook/borrower", (req, res) => {
  const { monthlyIncome, employmentStatus } = req.body;

  if (!monthlyIncome || !employmentStatus) {
    return res.status(400).json({
      success: false,
      message:
        "Monthly income and employment status are required for borrower registration",
    });
  }

  const params = new URLSearchParams({
    role: ROLE_TYPES.BORROWER,
    monthlyIncome: monthlyIncome.toString(),
    employmentStatus,
  });

  res.redirect(`/auth/facebook?${params.toString()}`);
});

/**
 * @swagger
 * /auth/facebook/lender:
 *   post:
 *     summary: Register as lender via Facebook OAuth
 *     tags: [OAuth, Roles]
 *     description: Redirects to Facebook OAuth with lender role pre-selected
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lendingCapacity
 *               - interestRatePersonal
 *             properties:
 *               lendingCapacity:
 *                 type: number
 *                 description: Maximum lending capacity
 *               interestRatePersonal:
 *                 type: number
 *                 description: Base interest rate for personal loans
 *     responses:
 *       302:
 *         description: Redirect to Facebook authentication with lender role
 */
AuthRouter.post("/facebook/lender", (req, res) => {
  const { lendingCapacity, interestRatePersonal } = req.body;

  if (!lendingCapacity || !interestRatePersonal) {
    return res.status(400).json({
      success: false,
      message:
        "Lending capacity and interest rate are required for lender registration",
    });
  }

  const params = new URLSearchParams({
    role: ROLE_TYPES.LENDER,
    lendingCapacity: lendingCapacity.toString(),
    interestRatePersonal: interestRatePersonal.toString(),
  });

  res.redirect(`/auth/facebook?${params.toString()}`);
});
export default AuthRouter;
