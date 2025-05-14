// Import all necessary modules
import express from "express";
import {
  AuthSuccess,
  FacebookCallback,
  GetUserProfile,
  GoogleCallback,
  Login,
  Logout,
  RefreshToken,
  SignUp,
} from "../controller/authController.js";
import {
  Authenticated,
  facebookAuth,
  facebookAuthCallback,
  googleAuth,
  googleAuthCallback,
  localAuth,
} from "../middleware/authMiddleware.js";

const AuthRouter = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Bad request - user already exists or missing fields
 *       500:
 *         description: Server error
 */
AuthRouter.post("/register", SignUp);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
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
AuthRouter.post("/login", Login);

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
 *     summary: Get user profile
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

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Authenticate with Google
 *     tags: [OAuth]
 *     description: Redirects to Google OAuth login page
 *     responses:
 *       302:
 *         description: Redirect to Google authentication
 */
AuthRouter.get("/google", googleAuth);

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

/**
 * @swagger
 * /auth/facebook:
 *   get:
 *     summary: Authenticate with Facebook
 *     tags: [OAuth]
 *     description: Redirects to Facebook OAuth login page
 *     responses:
 *       302:
 *         description: Redirect to Facebook authentication
 */
AuthRouter.get("/facebook", facebookAuth);

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

export default AuthRouter;
