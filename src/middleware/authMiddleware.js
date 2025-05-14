import passport from "passport";
import { ApiError } from "../helpers/ApiError.js";
import { VerifyAuthToken } from "../utils/tokenUtils.js";

export const Authenticated = (req, res, next) => {
  const authToken = req.headers.authorization;

  if (!authToken || !authToken.startsWith("Bearer ")) {
    return next(new ApiError(401, "No Token ,Authorization Denied :("));
  }
  const token = authToken.split(" ")[1];

  const decoded = VerifyAuthToken(token);

  if (!decoded) {
    return next(new ApiError(401, "Token is not valid! -_-"));
  }

  req.user = decoded.id;
  next();
};

// Passport middleware
export const jwtAuth = passport.authenticate("jwt", { session: false });

// Google authentication middleware
export const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

// Google callback middleware
export const googleAuthCallback = passport.authenticate("google", {
  failureRedirect: "/auth/login",
  session: false,
});

// Facebook authentication middleware
export const facebookAuth = passport.authenticate("facebook", {
  scope: ["email"],
});

// Facebook callback middleware
export const facebookAuthCallback = passport.authenticate("facebook", {
  failureRedirect: "/auth/login",
  session: false,
});

// Local authentication middleware
export const localAuth = passport.authenticate("local", {
  session: false,
});
