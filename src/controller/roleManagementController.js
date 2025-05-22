// // src/controller/roleManagementController.js

// import User from "../models/User.js";
// import { Role, ROLE_TYPES } from "../models/Role.js";
// import RoleUserService from "../utils/roleUserService.js";
// import { ApiError } from "../helpers/ApiError.js";
// import { ApiRes } from "../helpers/ApiRespones.js";
// import { asyncHandler } from "../helpers/asyncHandler.js";

// // Login handler with role verification
// export const RoleBasedLogin = asyncHandler(async (req, res, next) => {
//   // User is already authenticated through Passport middleware
//   const user = req.user;

//   if (!user) {
//     return next(new ApiError(401, "Authentication failed"));
//   }

//   // Get all roles assigned to the user
//   const roles = await Role.find({ users: user._id });

//   if (!roles || roles.length === 0) {
//     return next(new ApiError(403, "No roles assigned to this user"));
//   }

//   // Get complete user profile with role-specific information
//   const userProfile = await RoleUserService.getUserCompleteProfile(user._id);

//   // Extract role names for response
//   const roleNames = roles.map((role) => role.name);

//   // Return role-specific response
//   res.status(200).json(
//     new ApiRes(
//       200,
//       {
//         user: {
//           _id: user._id,
//           name: user.name,
//           email: user.email,
//           roles: roleNames,
//         },
//         roleSpecificData: {
//           isLender: roleNames.includes(ROLE_TYPES.LENDER),
//           isBorrower: roleNames.includes(ROLE_TYPES.BORROWER),
//           isManager: roleNames.includes(ROLE_TYPES.MANAGER),
//           isAdmin: roleNames.includes(ROLE_TYPES.ADMIN),
//           lenderProfile: userProfile.lenderProfile || null,
//           borrowerProfile: userProfile.borrowerProfile || null,
//         },
//       },
//       "Login successful"
//     )
//   );
// });

// // Route handler for normal user dashboard
// export const getUserDashboard = asyncHandler(async (req, res, next) => {
//   const userId = req.user;

//   try {
//     // Get user with basic account information
//     const user = await User.findById(userId);
//     if (!user) {
//       return next(new ApiError(404, "User not found"));
//     }

//     // Get accounts associated with this user
//     const accounts = await Account.find({ userId });

//     // Return dashboard data
//     res.status(200).json(
//       new ApiRes(200, {
//         user: {
//           name: user.name,
//           email: user.email,
//           accountNumber: user.accountNumber,
//         },
//         accounts: accounts.map((acc) => ({
//           id: acc._id,
//           accountNumber: acc.accountNumber,
//           accountType: acc.accountType,
//           balance: acc.balance,
//           currency: acc.currency,
//           status: acc.status,
//         })),
//       })
//     );
//   } catch (error) {
//     next(new ApiError(500, "Error fetching user dashboard"));
//   }
// });

// // Route handler for lender dashboard
// export const getLenderDashboard = asyncHandler(async (req, res, next) => {
//   const userId = req.user;

//   try {
//     // Get user's complete profile
//     const userProfile = await RoleUserService.getUserCompleteProfile(userId);

//     if (!userProfile.lenderProfile) {
//       return next(new ApiError(403, "User is not a lender"));
//     }

//     // Get loans where this user is the lender
//     const loans = await Loan.find({ lenderId: userId });

//     // Return dashboard data
//     res.status(200).json(
//       new ApiRes(200, {
//         user: {
//           name: userProfile.user.name,
//           email: userProfile.user.email,
//         },
//         lenderProfile: {
//           availableFunds: userProfile.lenderProfile.availableFunds,
//           totalFundsLent: userProfile.lenderProfile.totalFundsLent,
//           activeLoans: userProfile.lenderProfile.activeLoans,
//           interestRates: userProfile.lenderProfile.interestRate,
//         },
//         loans: loans.map((loan) => ({
//           id: loan._id,
//           borrowerId: loan.borrowerId,
//           amount: loan.amount,
//           term: loan.term,
//           interestRate: loan.interestRate,
//           status: loan.status,
//           purpose: loan.purpose,
//           nextPaymentDate: loan.nextPaymentDate,
//         })),
//       })
//     );
//   } catch (error) {
//     next(new ApiError(500, "Error fetching lender dashboard"));
//   }
// });

// // Route handler for borrower dashboard
// export const getBorrowerDashboard = asyncHandler(async (req, res, next) => {
//   const userId = req.user;

//   try {
//     // Get user's complete profile
//     const userProfile = await RoleUserService.getUserCompleteProfile(userId);

//     if (!userProfile.borrowerProfile) {
//       return next(new ApiError(403, "User is not a borrower"));
//     }

//     // Get loans where this user is the borrower
//     const loans = await Loan.find({ borrowerId: userId });

//     // Get accounts for this user
//     const accounts = await Account.find({ userId });

//     // Return dashboard data
//     res.status(200).json(
//       new ApiRes(200, {
//         user: {
//           name: userProfile.user.name,
//           email: userProfile.user.email,
//           accountNumber: userProfile.user.accountNumber,
//         },
//         borrowerProfile: {
//           creditScore: userProfile.borrowerProfile.creditScore,
//           totalDebt: userProfile.borrowerProfile.totalDebt,
//           monthlyIncome: userProfile.borrowerProfile.monthlyIncome,
//           debtToIncomeRatio: userProfile.borrowerProfile.debtToIncomeRatio,
//         },
//         accounts: accounts.map((acc) => ({
//           id: acc._id,
//           accountNumber: acc.accountNumber,
//           accountType: acc.accountType,
//           balance: acc.balance,
//           currency: acc.currency,
//         })),
//         loans: loans.map((loan) => ({
//           id: loan._id,
//           lenderId: loan.lenderId,
//           amount: loan.amount,
//           remainingAmount: loan.remainingAmount,
//           instalmentAmount: loan.instalmentAmount,
//           nextPaymentDate: loan.nextPaymentDate,
//           status: loan.status,
//           purpose: loan.purpose,
//         })),
//       })
//     );
//   } catch (error) {
//     next(new ApiError(500, "Error fetching borrower dashboard"));
//   }
// });

// // Route handler for manager dashboard
// export const getManagerDashboard = asyncHandler(async (req, res, next) => {
//   const userId = req.user;

//   try {
//     // Check if user has manager role
//     const roles = await Role.find({ users: userId });
//     const isManager = roles.some((role) => role.name === ROLE_TYPES.MANAGER);

//     if (!isManager) {
//       return next(new ApiError(403, "User is not a manager"));
//     }

//     // Get statistics for manager dashboard
//     const totalUsers = await User.countDocuments();
//     const pendingLoans = await Loan.countDocuments({ status: "pending" });
//     const activeLoans = await Loan.countDocuments({ status: "active" });
//     const totalLenders = await Role.find({ name: ROLE_TYPES.LENDER }).populate(
//       "users"
//     );
//     const totalBorrowers = await Role.find({
//       name: ROLE_TYPES.BORROWER,
//     }).populate("users");

//     // Return dashboard data
//     res.status(200).json(
//       new ApiRes(200, {
//         systemStats: {
//           totalUsers,
//           totalLenders: totalLenders[0]?.users.length || 0,
//           totalBorrowers: totalBorrowers[0]?.users.length || 0,
//           pendingLoans,
//           activeLoans,
//         },
//         pendingApprovals: {
//           loanApplications: await Loan.find({ status: "pending" })
//             .populate("borrowerId", "name email")
//             .limit(10)
//             .select("borrowerId amount purpose applicationDate"),
//         },
//       })
//     );
//   } catch (error) {
//     next(new ApiError(500, "Error fetching manager dashboard"));
//   }
// });
