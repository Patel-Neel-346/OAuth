// // src/routes/roleRoutes.js

// import express from "express";
// import { Authenticated, localAuth } from "../middleware/authMiddleware.js";
// import { hasRole } from "../middleware/roleMiddleware.js";
// import { ROLE_TYPES } from "../models/Role.js";
// import {
//   RoleBasedLogin,
//   getUserDashboard,
//   getLenderDashboard,
//   getBorrowerDashboard,
//   getManagerDashboard,
// } from "../controller/roleManagementController.js";

// const RoleRouter = express.Router();

// // Role-based login
// RoleRouter.post("/login", localAuth, RoleBasedLogin);

// // Role-specific dashboards
// RoleRouter.get("/dashboard/user", Authenticated, getUserDashboard);
// RoleRouter.get(
//   "/dashboard/lender",
//   Authenticated,
//   hasRole([ROLE_TYPES.LENDER]),
//   getLenderDashboard
// );
// RoleRouter.get(
//   "/dashboard/borrower",
//   Authenticated,
//   hasRole([ROLE_TYPES.BORROWER]),
//   getBorrowerDashboard
// );
// RoleRouter.get(
//   "/dashboard/manager",
//   Authenticated,
//   hasRole([ROLE_TYPES.MANAGER]),
//   getManagerDashboard
// );

// export default RoleRouter;
