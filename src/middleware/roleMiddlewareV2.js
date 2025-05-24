// src/middleware/roleMiddleware.js - Enhanced version with account-specific permissions
import { ApiError } from "../helpers/ApiError.js";
import Role from "../models/Role.js";
import Account from "../models/Account.js";
import { ROLE_TYPES } from "../models/Role.js";
import RoleUserService from "../utils/roleUserService.js";

// Basic role checking middleware (existing functionality - enhanced)
export const hasRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const userId = req.user;

      if (!userId) {
        return next(new ApiError(401, "User not authenticated"));
      }

      const userRoles = await Role.find({ users: userId });

      if (!userRoles || userRoles.length === 0) {
        return next(new ApiError(403, "No roles assigned to user"));
      }

      const roleNames = userRoles.map((role) => role.name);

      // Check if user has any of the allowed roles
      const hasRequiredRole = roleNames.some((role) =>
        allowedRoles.includes(role)
      );

      if (!hasRequiredRole) {
        return next(
          new ApiError(
            403,
            `Access Denied: Requires one of the following roles: ${allowedRoles.join(
              ", "
            )}`
          )
        );
      }

      // Attach user roles to request for use in controllers
      req.userRoles = roleNames;
      next();
    } catch (error) {
      console.error("Role middleware error:", error);
      return next(new ApiError(500, "Error checking user permissions"));
    }
  };
};

// Account ownership verification middleware
export const verifyAccountOwnership = async (req, res, next) => {
  try {
    const userId = req.user;
    const { accountId } = req.params;

    if (!accountId) {
      return next(new ApiError(400, "Account ID is required"));
    }

    // Get user roles
    const userProfile = await RoleUserService.getUserCompleteProfile(userId);

    // Admins and managers can access any account
    if (
      userProfile.roles.includes(ROLE_TYPES.ADMIN) ||
      userProfile.roles.includes(ROLE_TYPES.MANAGER)
    ) {
      req.userRoles = userProfile.roles;
      return next();
    }

    // For regular users, verify they own the account
    const account = await Account.findOne({
      _id: accountId,
      userId: userId,
    });

    if (!account) {
      return next(
        new ApiError(404, "Account not found or you don't have access to it")
      );
    }

    req.userRoles = userProfile.roles;
    req.accountOwnership = {
      isOwner: true,
      account: account,
    };

    next();
  } catch (error) {
    console.error("Account ownership verification error:", error);
    return next(new ApiError(500, "Error verifying account ownership"));
  }
};

// Account type access control middleware
export const canAccessAccountType = (allowedAccountTypes) => {
  return async (req, res, next) => {
    try {
      const userId = req.user;
      const accountType = req.body.accountType || req.params.accountType;

      if (!accountType) {
        return next(new ApiError(400, "Account type is required"));
      }

      // Get user profile with roles
      const userProfile = await RoleUserService.getUserCompleteProfile(userId);

      // Admins can access all account types
      if (userProfile.roles.includes(ROLE_TYPES.ADMIN)) {
        req.userRoles = userProfile.roles;
        return next();
      }

      // Check if the account type is in allowed types
      if (!allowedAccountTypes.includes(accountType)) {
        return next(
          new ApiError(
            403,
            `Account type '${accountType}' is not allowed for this operation`
          )
        );
      }

      // Role-specific account type validation
      const canAccess = await validateAccountTypeByRole(
        accountType,
        userProfile.roles,
        userProfile
      );

      if (!canAccess.allowed) {
        return next(new ApiError(403, canAccess.message));
      }

      req.userRoles = userProfile.roles;
      next();
    } catch (error) {
      console.error("Account type access control error:", error);
      return next(new ApiError(500, "Error checking account type access"));
    }
  };
};

// Middleware to check if user can perform account operations
export const canPerformAccountOperation = (operation) => {
  return async (req, res, next) => {
    try {
      const userId = req.user;
      const { accountId } = req.params;

      // Get user profile
      const userProfile = await RoleUserService.getUserCompleteProfile(userId);

      // Get account if accountId is provided
      let account = null;
      if (accountId) {
        account = await Account.findById(accountId);
        if (!account) {
          return next(new ApiError(404, "Account not found"));
        }
      }

      // Check operation permissions based on role and operation type
      const canPerform = await checkOperationPermission(
        operation,
        userProfile.roles,
        account,
        userId
      );

      if (!canPerform.allowed) {
        return next(new ApiError(403, canPerform.message));
      }

      req.userRoles = userProfile.roles;
      req.targetAccount = account;
      next();
    } catch (error) {
      console.error("Account operation permission error:", error);
      return next(new ApiError(500, "Error checking operation permissions"));
    }
  };
};

// Enhanced middleware for account status updates
export const canUpdateAccountStatus = async (req, res, next) => {
  try {
    const userId = req.user;
    const { accountId } = req.params;
    const { status } = req.body;

    if (!status) {
      return next(new ApiError(400, "Status is required"));
    }

    const userProfile = await RoleUserService.getUserCompleteProfile(userId);
    const account = await Account.findById(accountId);

    if (!account) {
      return next(new ApiError(404, "Account not found"));
    }

    // Status update permissions
    const statusPermissions = {
      [ROLE_TYPES.ADMIN]: ["active", "inactive", "suspended", "closed"],
      [ROLE_TYPES.MANAGER]: ["active", "inactive", "suspended"],
      [ROLE_TYPES.USER]: ["inactive"], // Users can only deactivate their own accounts
      [ROLE_TYPES.BORROWER]: ["inactive"],
      [ROLE_TYPES.LENDER]: ["inactive"],
    };

    // Check if user has permission to set this status
    let canSetStatus = false;
    let allowedStatuses = [];

    userProfile.roles.forEach((role) => {
      if (statusPermissions[role]) {
        allowedStatuses = [
          ...new Set([...allowedStatuses, ...statusPermissions[role]]),
        ];
        if (statusPermissions[role].includes(status)) {
          canSetStatus = true;
        }
      }
    });

    if (!canSetStatus) {
      return next(
        new ApiError(
          403,
          `You don't have permission to set status to '${status}'. Allowed statuses: ${allowedStatuses.join(
            ", "
          )}`
        )
      );
    }

    // Additional check: non-admin users can only update their own accounts
    if (
      !userProfile.roles.includes(ROLE_TYPES.ADMIN) &&
      !userProfile.roles.includes(ROLE_TYPES.MANAGER) &&
      account.userId.toString() !== userId.toString()
    ) {
      return next(
        new ApiError(403, "You can only update the status of your own accounts")
      );
    }

    req.userRoles = userProfile.roles;
    next();
  } catch (error) {
    console.error("Account status update permission error:", error);
    return next(new ApiError(500, "Error checking status update permissions"));
  }
};

// HELPER FUNCTIONS

// Validate account type access based on user roles
async function validateAccountTypeByRole(accountType, userRoles, userProfile) {
  const accountTypePermissions = {
    savings: [
      ROLE_TYPES.USER,
      ROLE_TYPES.BORROWER,
      ROLE_TYPES.LENDER,
      ROLE_TYPES.ADMIN,
    ],
    checking: [
      ROLE_TYPES.USER,
      ROLE_TYPES.BORROWER,
      ROLE_TYPES.LENDER,
      ROLE_TYPES.ADMIN,
    ],
    loan: [ROLE_TYPES.BORROWER, ROLE_TYPES.ADMIN],
    credit: [ROLE_TYPES.BORROWER, ROLE_TYPES.LENDER, ROLE_TYPES.ADMIN],
    investment: [ROLE_TYPES.LENDER, ROLE_TYPES.ADMIN],
  };

  const allowedRoles = accountTypePermissions[accountType] || [];

  // Check if user has any allowed role for this account type
  const hasAllowedRole = userRoles.some((role) => allowedRoles.includes(role));

  if (!hasAllowedRole) {
    return {
      allowed: false,
      message: `Account type '${accountType}' requires one of these roles: ${allowedRoles.join(
        ", "
      )}`,
    };
  }

  // Additional validation for specific account types
  if (accountType === "loan" && userRoles.includes(ROLE_TYPES.BORROWER)) {
    if (
      userProfile.borrowerProfile &&
      userProfile.borrowerProfile.verificationStatus !== "verified"
    ) {
      return {
        allowed: false,
        message: "Borrower profile must be verified to access loan accounts",
      };
    }
  }

  if (accountType === "investment" && userRoles.includes(ROLE_TYPES.LENDER)) {
    if (
      userProfile.lenderProfile &&
      userProfile.lenderProfile.verificationStatus !== "verified"
    ) {
      return {
        allowed: false,
        message:
          "Lender profile must be verified to access investment accounts",
      };
    }
  }

  return { allowed: true };
}

// Check specific operation permissions
async function checkOperationPermission(operation, userRoles, account, userId) {
  const operationPermissions = {
    create: {
      [ROLE_TYPES.USER]: true,
      [ROLE_TYPES.BORROWER]: true,
      [ROLE_TYPES.LENDER]: true,
      [ROLE_TYPES.ADMIN]: true,
    },
    read: {
      [ROLE_TYPES.USER]: "own",
      [ROLE_TYPES.BORROWER]: "own",
      [ROLE_TYPES.LENDER]: "own",
      [ROLE_TYPES.MANAGER]: "all",
      [ROLE_TYPES.ADMIN]: "all",
    },
    update: {
      [ROLE_TYPES.USER]: "own_limited",
      [ROLE_TYPES.BORROWER]: "own_limited",
      [ROLE_TYPES.LENDER]: "own_limited",
      [ROLE_TYPES.MANAGER]: "all_limited",
      [ROLE_TYPES.ADMIN]: "all",
    },
    delete: {
      [ROLE_TYPES.USER]: "own",
      [ROLE_TYPES.BORROWER]: "own",
      [ROLE_TYPES.LENDER]: "own",
      [ROLE_TYPES.ADMIN]: "all",
    },
  };

  if (!operationPermissions[operation]) {
    return { allowed: false, message: "Invalid operation" };
  }

  // Check if user has any role that allows this operation
  let highestPermission = null;
  userRoles.forEach((role) => {
    const permission = operationPermissions[operation][role];
    if (permission) {
      if (permission === "all" || permission === true) {
        highestPermission = "all";
      } else if (
        !highestPermission ||
        (highestPermission === "own_limited" && permission === "own") ||
        (highestPermission === "own" && permission === "all_limited")
      ) {
        highestPermission = permission;
      }
    }
  });

  if (!highestPermission) {
    return {
      allowed: false,
      message: `You don't have permission to ${operation} accounts`,
    };
  }

  // If operation requires account ownership check
  if (
    account &&
    (highestPermission === "own" || highestPermission === "own_limited") &&
    account.userId.toString() !== userId.toString()
  ) {
    return {
      allowed: false,
      message: `You can only ${operation} your own accounts`,
    };
  }

  return { allowed: true, permission: highestPermission };
}

// Export additional utility functions for controllers
export const getRoleBasedAccountFilter = async (userId, userRoles) => {
  if (
    userRoles.includes(ROLE_TYPES.ADMIN) ||
    userRoles.includes(ROLE_TYPES.MANAGER)
  ) {
    return {}; // No filter - can see all accounts
  }
  return { userId }; // Filter to only user's accounts
};

export const getRoleBasedFieldFilter = (userRoles) => {
  if (
    userRoles.includes(ROLE_TYPES.ADMIN) ||
    userRoles.includes(ROLE_TYPES.MANAGER)
  ) {
    return {}; // No field restrictions
  }

  // Regular users see limited fields
  return {
    _id: 1,
    accountNumber: 1,
    accountType: 1,
    balance: 1,
    currency: 1,
    status: 1,
    interestRate: 1,
    createdAt: 1,
    updatedAt: 1,
  };
};
