import { ApiError } from "../helpers/ApiError.js";
import { ApiRes } from "../helpers/ApiRespones.js";
import { asyncHandler } from "../helpers/asyncHandler.js";
import Account from "../models/Account.js";
import TransactionServiceV2 from "../services/TransactionService.js";

export const DepositFunds = asyncHandler(async (req, res, next) => {
  const { accountNumber, amount, description } = req.body;

  const userId = req.user;

  try {
    const account = await Account.findOne({ accountNumber: accountNumber });
    console.log(account._id.toString());

    if (!account) {
      return next(new ApiError(404, "Account not Found :("));
    }

    const result = await TransactionServiceV2.DepositFunds(
      account._id.toString(),
      parseFloat(amount),
      description || "Deposit",
      {
        initiateBy: userId,
      }
    );

    // console.log(result);

    return res
      .status(200)
      .json(
        new ApiRes(200, result, "Deposit Completed SuccessFully :) ye ye ye ")
      );
  } catch (error) {
    console.log("Deposit Error:", error);
    return next(new ApiError(500, `Deposit Error:${error.message}`));
  }
});

export const WithDrawFunds = asyncHandler(async (req, res, next) => {
  const { accountNumber, amount, description } = req.body;
  const userId = req.body;

  try {
    const account = await Account.findOne({ accountNumber });
    if (!account) {
      return next(new ApiError(404, "Account not Found in Controller :("));
    }

    const result = await TransactionServiceV2.WithdrawFunds(
      account._id.toString(),
      parseFloat(amount),
      description || "Withdraw",
      {
        initiateBy: userId,
      }
    );

    return res
      .status(200)
      .json(new ApiRes(200, result, "Withdraw Completed SuccessFully :) "));
  } catch (error) {
    console.log("WithDraw Error At WithDraw Controller :(");
    return next(new ApiError(500, `${error.message}`));
  }
});

export const TransferFunds = asyncHandler(async (req, res, next) => {});
