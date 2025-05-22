// src/middleware/authMiddleware.js - Enhanced OAuth middleware

import passport from "passport";
import { ApiError } from "../helpers/ApiError.js";
import { VerifyAuthToken } from "../utils/tokenUtils.js";
import { ROLE_TYPES } from "../models/Role.js";

// Existing middleware (keep as is)
export const Authenticated = (req, res, next) => {
  const authToken =
    req.cookies.authToken ||
    (req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null);

  if (!authToken) {
    return next(new ApiError(401, "No Token, Authorization Denied :("));
  }

  const decoded = VerifyAuthToken(authToken);

  if (!decoded) {
    return next(new ApiError(401, "Token is not valid! -_-"));
  }

  req.user = decoded.id;
  next();
};

export const jwtAuth = passport.authenticate("jwt", { session: false });

// Enhanced Google OAuth middleware with role support
export const googleAuth = (req, res, next) => {
  // Extract role and profile data from query params and store in session
  const {
    role,
    monthlyIncome,
    employmentStatus,
    lendingCapacity,
    interestRatePersonal,
  } = req.query;

  // Store role selection in session for later use in callback
  if (role && Object.values(ROLE_TYPES).includes(role.toUpperCase())) {
    req.session.oauthRole = role.toUpperCase();
    req.session.oauthProfileData = {
      monthlyIncome: monthlyIncome ? parseFloat(monthlyIncome) : undefined,
      employmentStatus,
      lendingCapacity: lendingCapacity
        ? parseFloat(lendingCapacity)
        : undefined,
      interestRatePersonal: interestRatePersonal
        ? parseFloat(interestRatePersonal)
        : undefined,
    };
  }

  return passport.authenticate("google", {
    scope: ["profile", "email"],
  })(req, res, next);
};

export const googleAuthCallback = (req, res, next) => {
  return passport.authenticate("google", {
    failureRedirect: "/auth/login?error=oauth_failed",
    session: false,
  })(req, res, (err) => {
    if (err) return next(err);

    // Transfer role data from session to query for callback handler
    if (req.session.oauthRole) {
      req.query.role = req.session.oauthRole;

      // Add profile data based on role
      if (req.session.oauthRole === ROLE_TYPES.BORROWER) {
        req.query.monthlyIncome =
          req.session.oauthProfileData?.monthlyIncome || 0;
        req.query.employmentStatus =
          req.session.oauthProfileData?.employmentStatus || "unemployed";
        req.query.creditScore = 700; // Default credit score
        req.query.totalDebt = 0; // Default total debt
      } else if (req.session.oauthRole === ROLE_TYPES.LENDER) {
        req.query.lendingCapacity =
          req.session.oauthProfileData?.lendingCapacity || 0;
        req.query.availableFunds =
          req.session.oauthProfileData?.lendingCapacity || 0;
        req.query.interestRatePersonal =
          req.session.oauthProfileData?.interestRatePersonal || 5;
        req.query.interestRateBusiness =
          (req.session.oauthProfileData?.interestRatePersonal || 5) + 1.5;
        req.query.interestRateHome =
          (req.session.oauthProfileData?.interestRatePersonal || 5) - 1;
      }

      // Clean up session
      delete req.session.oauthRole;
      delete req.session.oauthProfileData;
    }

    next();
  });
};

// Enhanced Facebook OAuth middleware with role support
export const facebookAuth = (req, res, next) => {
  // Extract role and profile data from query params and store in session
  const {
    role,
    monthlyIncome,
    employmentStatus,
    lendingCapacity,
    interestRatePersonal,
  } = req.query;

  // Store role selection in session for later use in callback
  if (role && Object.values(ROLE_TYPES).includes(role.toUpperCase())) {
    req.session.oauthRole = role.toUpperCase();
    req.session.oauthProfileData = {
      monthlyIncome: monthlyIncome ? parseFloat(monthlyIncome) : undefined,
      employmentStatus,
      lendingCapacity: lendingCapacity
        ? parseFloat(lendingCapacity)
        : undefined,
      interestRatePersonal: interestRatePersonal
        ? parseFloat(interestRatePersonal)
        : undefined,
    };
  }

  return passport.authenticate("facebook", {
    scope: ["email"],
  })(req, res, next);
};

export const facebookAuthCallback = (req, res, next) => {
  return passport.authenticate("facebook", {
    failureRedirect: "/auth/login?error=oauth_failed",
    session: false,
  })(req, res, (err) => {
    if (err) return next(err);

    // Transfer role data from session to query for callback handler
    if (req.session.oauthRole) {
      req.query.role = req.session.oauthRole;

      // Add profile data based on role
      if (req.session.oauthRole === ROLE_TYPES.BORROWER) {
        req.query.monthlyIncome =
          req.session.oauthProfileData?.monthlyIncome || 0;
        req.query.employmentStatus =
          req.session.oauthProfileData?.employmentStatus || "unemployed";
        req.query.creditScore = 700; // Default credit score
        req.query.totalDebt = 0; // Default total debt
      } else if (req.session.oauthRole === ROLE_TYPES.LENDER) {
        req.query.lendingCapacity =
          req.session.oauthProfileData?.lendingCapacity || 0;
        req.query.availableFunds =
          req.session.oauthProfileData?.lendingCapacity || 0;
        req.query.interestRatePersonal =
          req.session.oauthProfileData?.interestRatePersonal || 5;
        req.query.interestRateBusiness =
          (req.session.oauthProfileData?.interestRatePersonal || 5) + 1.5;
        req.query.interestRateHome =
          (req.session.oauthProfileData?.interestRatePersonal || 5) - 1;
      }

      // Clean up session
      delete req.session.oauthRole;
      delete req.session.oauthProfileData;
    }

    next();
  });
};

export const localAuth = passport.authenticate("local", {
  session: false,
});
