import { ApiError } from "../helpers/ApiError.js";
import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";

class TransactionServiceV2 {
  static async DepositFunds(
    accountId,
    amount,
    description = "Deposit",
    metadata = {}
  ) {
    try {
      if (amount <= 0) {
        throw new ApiError(
          400,
          "Deposit amount must be Greather Than Zero 0 :)"
        );
      }
      console.log("AccountId:", accountId);
      const account = await Account.findById(accountId);
      console.log(account);
      if (!account) {
        throw new ApiError(400, "Account Not Found");
      }

      if (account.status != "active") {
        throw new ApiError(
          400,
          `Can't deposit Amount to ${account.status} Account`
        );
      }

      const transaction = new Transaction({
        toAccount: accountId,
        amount,
        type: "deposit",
        description,
        status: "pending",
        reference: `DEPOSIT ${Date.now()}${Math.floor(Math.random() * 1000)}`,
        metadata,
      });
      await transaction.save();

      account.balance += amount;
      await account.save();

      transaction.status = "completed";
      transaction.processAt = new Date();
      await transaction.save();

      //return respone
      return {
        transaction,
        account: {
          accountNumber: account.accountNumber,
          newBalance: account.balance,
          currency: account.currency,
        },
      };
    } catch (error) {
      console.log("Got error at Transaction Deposit Service");
      throw error;
    }
  }

  static async WithdrawFunds(
    accountId,
    amount,
    description = "Withdraw",
    metadata = {}
  ) {
    try {
      if (amount <= 0) {
        throw new ApiError(400, "Withdraw amount must be grather than zero 0 ");
      }

      const account = await Account.findById(accountId);
      if (!account) {
        throw new ApiError(404, "sorry litle bro your account not found ");
      }

      if (account.status != "active") {
        throw new ApiError(404, "atleast Actived You accoutn litle bro ");
      }

      if (account.balance <= amount) {
        throw new ApiError(
          404,
          "You are broke litle bro atleast put so money in bank lol ,you are poor man"
        );
      }

      const transaction = new Transaction({
        toAccount: accountId,
        amount,
        type: "withdrawal",
        description,
        status: "pending",
        reference: `WITHDRAW ${Date.now()}${Math.floor(Math.random() * 1000)}`,
        metadata,
      });

      await transaction.save();

      account.balance -= amount;
      await account.save();

      transaction.status = "completed";
      transaction.processAt = new Date();
      await transaction.save();

      //return respone
      return {
        transaction,
        account: {
          accountNumber: account.accountNumber,
          newBalance: account.balance,
          currency: account.currency,
        },
      };
    } catch (error) {
      console.log("WithDraw Error:", error);
      throw error;
    }
  }
}

export default TransactionServiceV2;
