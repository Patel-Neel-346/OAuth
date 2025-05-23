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

export const TransferFunds = asyncHandler(async (req, res, next) => {
  const { fromAccountNumber, toAccountNumber, amount, description } = req.body;

  const userId = req.user;

  try {
    const fromAccount = await Account.findOne({
      accountNumber: fromAccountNumber,
    });
    console.log(fromAccount);

    if (!fromAccount) {
      return next(new ApiError(404, "Source account not found man :("));
    }

    const toAccount = await Account.findOne({
      accountNumber: toAccountNumber,
    });
    console.log(toAccount);
    if (!toAccount) {
      return next(new ApiError(404, "Destination account not Found man"));
    }

    if (fromAccount._id.toString() === toAccount._id.toString()) {
      return next(
        new ApiError(
          404,
          "Bro can not tranfer money to Your Same account man :("
        )
      );
    }

    const result = await TransactionServiceV2.TransferFunds(
      fromAccount._id.toString(),
      toAccount._id.toString(),
      parseFloat(amount),
      description || "Transfer",
      {
        initiatedBy: userId,
      }
    );

    res
      .status(200)
      .json(
        new ApiRes(
          200,
          result,
          "Transfer Completed Successfully Buddy Enjoy :)"
        )
      );
  } catch (error) {
    console.log(`Transfer Error:${error}`);
    return next(new ApiError(500, "Transfer error controller"));
  }
});

export const GetAccountBalance = asyncHandler(async (req, res, next) => {
  const { accountNumber } = req.params || req.query;
  const { limit = 10 } = req.params || req.query;

  const userId = req.user;

  try {
    const account = await Account.findOne({
      accountNumber: accountNumber,
      userId,
    });
    if (!account) {
      return next(new ApiError(404, "Account not found bro :("));
    }

    const result = await TransactionServiceV2.GetAccountBalance(
      account._id.toString(),
      parseInt(limit)
    );

    res
      .status(200)
      .json(new ApiRes(200, result, "Account Balance Retrived SuccessFully"));
  } catch (error) {
    console.log(`Account Balance Error:${error.message}`);
    return next(new ApiError(500, `Balance Error in Account ${error.message}`));
  }
});

export const GetTransactionHistory = asyncHandler(async (req, res, next) => {});

export const TransactionSummary = asyncHandler(async (req, res, next) => {});
