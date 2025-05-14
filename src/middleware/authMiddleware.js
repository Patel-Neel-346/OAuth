import { ApiError } from "../helpers/ApiError";
import { VerifyAuthToken } from "../utils/tokenUtils";

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
