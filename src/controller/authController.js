import { ApiError } from "../helpers/ApiError.js";
import { ApiRes } from "../helpers/ApiRespones.js";
import { asyncHandler } from "../helpers/asyncHandler.js";
import User from "../models/User.js";
import {
  generateAuthToken,
  generateRefreshToken,
  VerifyRefreshToken,
} from "../utils/tokenUtils.js";

export const SignUp = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(new ApiError(400, "Please provide all fields"));
  }

  const userExits = await User.findOne({ email });
  if (userExits) {
    return next(new ApiError(400, "User already exists"));
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  const authToken = generateAuthToken(user);
  const refreshToken = generateRefreshToken(user);
  user.refreshToken = refreshToken;

  await user.save();

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,

    // secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.cookie("authToken", authToken, {
    httpOnly: true,
    maxAge: 60 * 60 * 1000, // 1 hour

    // secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(201).json(
    new ApiRes(201, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      authToken,
      refreshToken,
    })
  );
});
export const Login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if all fields are provided
  if (!email || !password) {
    return next(new ApiError(400, "Please provide email and password"));
  }

  // Check if user exists
  const user = await User.findOne({ email });

  if (!user) {
    return next(new ApiError(401, "Invalid credentials"));
  }

  // Check if password is correct
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return next(new ApiError(401, "Invalid credentials"));
  }

  // Generate tokens
  const authToken = generateAuthToken(user);
  const refreshToken = generateRefreshToken(user);

  // Save refresh token to user
  user.refreshToken = refreshToken;
  await user.save();

  // Set cookies
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.cookie("authToken", authToken, {
    httpOnly: true,
    maxAge: 60 * 60 * 1000, // 1 hour
  });

  res.status(200).json(
    new ApiRes(200, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      authToken,
      refreshToken,
    })
  );
});
export const RefreshToken = asyncHandler(async (req, res, next) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;

  if (!token) {
    return next(new ApiError(401, "No refresh token provided"));
  }

  // Verify refresh token
  const decoded = VerifyRefreshToken(token);

  if (!decoded) {
    return next(new ApiError(401, "Invalid refresh token"));
  }

  // Find user with this refresh token
  const user = await User.findOne({ _id: decoded.id, refreshToken: token });

  if (!user) {
    return next(new ApiError(401, "Refresh token is not valid"));
  }

  // Generate new auth token
  const authToken = generateAuthToken(user);

  // Set cookie
  res.cookie("authToken", authToken, {
    httpOnly: true,
    maxAge: 60 * 60 * 1000, // 1 hour
  });

  res.status(200).json(
    new ApiRes(200, {
      authToken,
      message: "Successfully Token Updated",
    })
  );
});
export const Logout = asyncHandler(async (req, res, next) => {});
export const GetUserProfile = asyncHandler(async (req, res, next) => {});

export const GoogleCallback = asyncHandler(async (req, res, next) => {
  const user = req.user;

  // Generate tokens
  const authToken = generateAuthToken(user);
  const refreshToken = generateRefreshToken(user);

  // Save refresh token to user
  user.refreshToken = refreshToken;
  await user.save();

  // Set cookies
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.cookie("authToken", authToken, {
    httpOnly: true,
    maxAge: 60 * 60 * 1000, // 1 hour
  });

  // Redirect to frontend or send response
  res.redirect(`/auth/success?token=${authToken}`);
});
export const FacebookCallback = asyncHandler(async (req, res, next) => {});
export const AuthSuccess = asyncHandler(async (req, res, next) => {});
