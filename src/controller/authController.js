import { ApiError } from "../helpers/ApiError.js";
import { ApiRes } from "../helpers/ApiRespones.js";
import { asyncHandler } from "../helpers/asyncHandler.js";
import User from "../models/User.js";
import {
  generateAuthToken,
  generateRefreshToken,
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
export const Login = asyncHandler(async (req, res, next) => {});
export const RefreshToken = asyncHandler(async (req, res, next) => {});
export const Logout = asyncHandler(async (req, res, next) => {});
export const GetUserProfile = asyncHandler(async (req, res, next) => {});

export const GoogleCallback = asyncHandler(async (req, res, next) => {});
export const FacebookCallback = asyncHandler(async (req, res, next) => {});
export const AuthSuccess = asyncHandler(async (req, res, next) => {});
