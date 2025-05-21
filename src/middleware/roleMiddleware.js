// src/middleware/roleMiddleware.js - Fixed version

import { ApiError } from "../helpers/ApiError.js";
import Role from "../models/Role.js";

export const hasRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const userId = req.user;

      const userRoles = await Role.find({ users: userId });

      const roleNames = userRoles.map((role) => role.name);

      // Fixed: include() should be includes()
      const hasRoles = roleNames.some((role) => allowedRoles.includes(role));

      if (!hasRoles) {
        return next(
          new ApiError(403, "Access Denied: Insufficient Permissions")
        );
      }

      req.userRoles = roleNames;
      next();
    } catch (error) {
      return next(new ApiError(500, "Error checking user permissions"));
    }
  };
};
