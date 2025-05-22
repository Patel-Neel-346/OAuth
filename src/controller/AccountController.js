import { asyncHandler } from "../helpers/asyncHandler.js";
import { ApiError } from "../helpers/ApiError.js";
import { ApiRes } from "../helpers/ApiRespones.js";
import Account from "../models/Account.js";
import User from "../models/User.js";
import RoleUserService from "../utils/roleUserService.js";
import { ROLE_TYPES } from "../models/Role.js";

// Create a new account for authenticated user
export const CreateAccount = asyncHandler(async (req, res, next) => {
  const { accountType, initialDeposit = 0, currency = "₹" } = req.body;
  const userId = req.user;

  // Validate required fields
  if (!accountType) {
    return next(new ApiError(400, "Account type is required"));
  }

  // Validate account type
  const validAccountTypes = [
    "savings",
    "checking",
    "loan",
    "credit",
    "investment",
  ];
  if (!validAccountTypes.includes(accountType)) {
    return next(new ApiError(400, "Invalid account type"));
  }

  try {
    // Get user information
    const user = await User.findById(userId);
    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    // Get user's complete profile with roles
    const userProfile = await RoleUserService.getUserCompleteProfile(userId);

    // Check if user can create this type of account based on their roles
    const canCreateAccount = await validateAccountCreation(
      accountType,
      userProfile.roles
    );
    if (!canCreateAccount.allowed) {
      return next(new ApiError(403, canCreateAccount.message));
    }

    // Generate unique account number
    const accountNumber = await generateAccountNumber(accountType);

    // Validate initial deposit for certain account types
    if (accountType === "savings" && initialDeposit < 100) {
      return next(
        new ApiError(400, "Minimum initial deposit for savings account is ₹100")
      );
    }

    if (accountType === "checking" && initialDeposit < 50) {
      return next(
        new ApiError(400, "Minimum initial deposit for checking account is ₹50")
      );
    }

    // Set interest rate based on account type and user profile
    const interestRate = calculateInterestRate(accountType, userProfile);

    // Create the account
    const newAccount = await Account.create({
      userId,
      accountNumber,
      accountType,
      balance: initialDeposit,
      currency,
      interestRate,
      status: "active",
    });

    // Update user's account number if this is their first account
    if (
      !user.accountNumber &&
      (accountType === "savings" || accountType === "checking")
    ) {
      user.accountNumber = accountNumber;
      await user.save();
    }

    res.status(201).json(
      new ApiRes(
        201,
        {
          account: {
            _id: newAccount._id,
            accountNumber: newAccount.accountNumber,
            accountType: newAccount.accountType,
            balance: newAccount.balance,
            currency: newAccount.currency,
            status: newAccount.status,
            interestRate: newAccount.interestRate,
            createdAt: newAccount.createdAt,
          },
        },
        "Account created successfully"
      )
    );
  } catch (error) {
    console.error("Account creation error:", error);
    return next(new ApiError(500, error.message || "Failed to create account"));
  }
});

// Get all accounts for authenticated user
export const getAllAccount = asyncHandler(async (req, res, next) => {
  const userId = req.user;
  const { status, accountType, page = 1, limit = 10 } = req.query;

  try {
    // Build filter query
    const filter = { userId };

    if (status) {
      filter.status = status;
    }

    if (accountType) {
      filter.accountType = accountType;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get accounts with pagination
    const accounts = await Account.find(filter)
      .select("-__v")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalAccounts = await Account.countDocuments(filter);
    const totalPages = Math.ceil(totalAccounts / parseInt(limit));

    // Calculate total balance across all accounts
    const totalBalance = accounts.reduce(
      (sum, account) => sum + account.balance,
      0
    );

    res.status(200).json(
      new ApiRes(
        200,
        {
          accounts,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalAccounts,
            hasNextPage: parseInt(page) < totalPages,
            hasPrevPage: parseInt(page) > 1,
          },
          summary: {
            totalBalance,
            accountCount: accounts.length,
            currency: accounts.length > 0 ? accounts[0].currency : "₹",
          },
        },
        "Accounts retrieved successfully"
      )
    );
  } catch (error) {
    console.error("Get accounts error:", error);
    return next(new ApiError(500, "Failed to retrieve accounts"));
  }
});

// Get specific account details for authenticated user
export const getUserAccount = asyncHandler(async (req, res, next) => {
  const userId = req.user;
  const { accountId } = req.params;

  try {
    // Find account belonging to the user
    const account = await Account.findOne({
      _id: accountId,
      userId,
    }).select("-__v");

    if (!account) {
      return next(new ApiError(404, "Account not found or access denied"));
    }

    // Get recent transactions (if you have a Transaction model)
    // const recentTransactions = await Transaction.find({ accountId })
    //   .sort({ createdAt: -1 })
    //   .limit(5);

    res.status(200).json(
      new ApiRes(
        200,
        {
          account,
          // recentTransactions: recentTransactions || []
        },
        "Account details retrieved successfully"
      )
    );
  } catch (error) {
    console.error("Get account error:", error);
    return next(new ApiError(500, "Failed to retrieve account details"));
  }
});

// Update account information
export const UpdateUserAccount = asyncHandler(async (req, res, next) => {
  const userId = req.user;
  const { accountId } = req.params;
  const updates = req.body;

  // Fields that can be updated
  const allowedUpdates = ["status", "interestRate"];
  const actualUpdates = {};

  // Filter allowed updates
  Object.keys(updates).forEach((key) => {
    if (allowedUpdates.includes(key)) {
      actualUpdates[key] = updates[key];
    }
  });

  if (Object.keys(actualUpdates).length === 0) {
    return next(new ApiError(400, "No valid fields to update"));
  }

  try {
    // Get user profile to check permissions
    const userProfile = await RoleUserService.getUserCompleteProfile(userId);

    // Only admins or account owners can update certain fields
    if (
      actualUpdates.interestRate &&
      !userProfile.roles.includes(ROLE_TYPES.ADMIN)
    ) {
      return next(
        new ApiError(403, "Only administrators can update interest rates")
      );
    }

    // Find and update account
    const account = await Account.findOneAndUpdate(
      { _id: accountId, userId },
      { ...actualUpdates, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).select("-__v");

    if (!account) {
      return next(new ApiError(404, "Account not found or access denied"));
    }

    res
      .status(200)
      .json(new ApiRes(200, { account }, "Account updated successfully"));
  } catch (error) {
    console.error("Update account error:", error);
    return next(new ApiError(500, error.message || "Failed to update account"));
  }
});

// Close/Deactivate user account
export const CloseUserAccount = asyncHandler(async (req, res, next) => {
  const userId = req.user;
  const { accountId } = req.params;
  const { reason, transferAccountId } = req.body;

  try {
    // Find the account to close
    const account = await Account.findOne({
      _id: accountId,
      userId,
    });

    if (!account) {
      return next(new ApiError(404, "Account not found or access denied"));
    }

    // Check if account can be closed
    if (account.status === "closed") {
      return next(new ApiError(400, "Account is already closed"));
    }

    if (account.balance > 0) {
      if (!transferAccountId) {
        return next(
          new ApiError(
            400,
            "Account has balance. Please specify transfer account or withdraw funds"
          )
        );
      }

      // Verify transfer account exists and belongs to user
      const transferAccount = await Account.findOne({
        _id: transferAccountId,
        userId,
        status: "active",
      });

      if (!transferAccount) {
        return next(
          new ApiError(404, "Transfer account not found or inactive")
        );
      }

      if (transferAccount._id.toString() === accountId) {
        return next(new ApiError(400, "Cannot transfer to the same account"));
      }

      // Transfer remaining balance
      transferAccount.balance += account.balance;
      await transferAccount.save();

      account.balance = 0;
    }

    // Close the account
    account.status = "closed";
    account.updatedAt = Date.now();
    await account.save();

    res.status(200).json(
      new ApiRes(
        200,
        {
          closedAccount: {
            accountNumber: account.accountNumber,
            accountType: account.accountType,
            finalBalance: 0,
            closedAt: account.updatedAt,
            reason: reason || "Account closure requested by user",
          },
          transferDetails: transferAccountId
            ? {
                transferredTo: transferAccountId,
                amount: account.balance,
              }
            : null,
        },
        "Account closed successfully"
      )
    );
  } catch (error) {
    console.error("Close account error:", error);
    return next(new ApiError(500, error.message || "Failed to close account"));
  }
});

// Helper function to validate account creation based on user roles
async function validateAccountCreation(accountType, userRoles) {
  // Basic account types available to all users
  const basicAccountTypes = ["savings", "checking"];

  if (basicAccountTypes.includes(accountType)) {
    return { allowed: true };
  }

  // Role-specific account types
  if (accountType === "loan") {
    if (userRoles.includes(ROLE_TYPES.BORROWER)) {
      return { allowed: true };
    }
    return {
      allowed: false,
      message:
        "Only borrowers can create loan accounts. Please register as a borrower first.",
    };
  }

  if (accountType === "investment") {
    if (
      userRoles.includes(ROLE_TYPES.LENDER) ||
      userRoles.includes(ROLE_TYPES.ADMIN)
    ) {
      return { allowed: true };
    }
    return {
      allowed: false,
      message:
        "Only lenders and administrators can create investment accounts.",
    };
  }

  if (accountType === "credit") {
    if (
      userRoles.includes(ROLE_TYPES.BORROWER) ||
      userRoles.includes(ROLE_TYPES.LENDER)
    ) {
      return { allowed: true };
    }
    return {
      allowed: false,
      message: "Credit accounts require borrower or lender role.",
    };
  }

  return { allowed: false, message: "Invalid account type" };
}

// Helper function to generate unique account number
async function generateAccountNumber(accountType) {
  const prefixes = {
    savings: "SAV",
    checking: "CHK",
    loan: "LON",
    credit: "CRD",
    investment: "INV",
  };

  const prefix = prefixes[accountType] || "ACC";
  let accountNumber;
  let isUnique = false;

  while (!isUnique) {
    const randomDigits = Math.floor(100000000 + Math.random() * 900000000);
    accountNumber = `${prefix}${randomDigits}`;

    const existingAccount = await Account.findOne({ accountNumber });
    if (!existingAccount) {
      isUnique = true;
    }
  }

  return accountNumber;
}

// Helper function to calculate interest rate based on account type and user profile
function calculateInterestRate(accountType, userProfile) {
  const baseRates = {
    savings: 3.5,
    checking: 0.5,
    loan: 8.5,
    credit: 18.0,
    investment: 5.0,
  };

  let rate = baseRates[accountType] || 0;

  // Adjust rates based on user profile
  if (
    userProfile.lenderProfile &&
    (accountType === "savings" || accountType === "investment")
  ) {
    // Lenders get slightly better rates
    rate += 0.5;
  }

  if (userProfile.borrowerProfile) {
    const creditScore = userProfile.borrowerProfile.creditScore;
    if (creditScore && accountType === "loan") {
      // Better credit score = lower loan rates
      if (creditScore >= 750) rate -= 1.0;
      else if (creditScore >= 700) rate -= 0.5;
      else if (creditScore < 600) rate += 1.0;
    }
  }

  return Math.max(0, rate); // Ensure rate is not negative
}
