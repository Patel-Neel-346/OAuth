import passport from "passport";
import { ApiError } from "../helpers/ApiError.js";
import { VerifyAuthToken } from "../utils/tokenUtils.js";

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

export const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

export const googleAuthCallback = passport.authenticate("google", {
  failureRedirect: "/auth/login",
  session: false,
});

export const facebookAuth = passport.authenticate("facebook", {
  scope: ["email"],
});

export const facebookAuthCallback = passport.authenticate("facebook", {
  failureRedirect: "/auth/login",
  session: false,
});

export const localAuth = passport.authenticate("local", {
  session: false,
});
