"use server";

import { getTransactionsByBankId } from "./transaction.actions";
import { getBanks, getBank } from "./user.actions";
import razorpayClient from "@/lib/razorpay";
import { parseStringify } from "../utils";

// Get multiple bank accounts
export const getAccounts = async ({ userId }: getAccountsProps) => {
  try {
    // get banks from db
    const banks = await getBanks({ userId });

    const accounts = await Promise.all(
      banks?.map(async (bank: Bank) => {
        // get each account info from Razorpay
        const accountData = await razorpayClient.customers.fetch(bank.customerId);

        const account = {
          id: accountData.id,
          name: accountData.name,
          email: accountData.email,
          contact: accountData.contact,
          appwriteItemId: bank.$id,
          shareableId: bank.shareableId,
        };

        return account;
      })
    );

    const totalBanks = accounts.length;

    return parseStringify({ data: accounts, totalBanks });
  } catch (error) {
    console.error("An error occurred while getting the accounts:", error);
  }
};

// Get one bank account
export const getAccount = async ({ appwriteItemId }: getAccountProps) => {
  try {
    // get bank from db
    const bank = await getBank({ documentId: appwriteItemId });

    // get account info from Razorpay
    const accountData = await razorpayClient.customers.fetch(bank.customerId);

    // get transfer transactions from appwrite
    const transferTransactionsData = await getTransactionsByBankId({
      bankId: bank.$id,
    });

    const transferTransactions = transferTransactionsData.documents.map(
      (transferData: Transaction) => ({
        id: transferData.$id,
        name: transferData.name!,
        amount: transferData.amount!,
        date: transferData.$createdAt,
        paymentChannel: transferData.channel,
        category: transferData.category,
        type: transferData.senderBankId === bank.$id ? "debit" : "credit",
      })
    );

    const account = {
      id: accountData.id,
      name: accountData.name,
      email: accountData.email,
      contact: accountData.contact,
      appwriteItemId: bank.$id,
    };

    // sort transactions by date such that the most recent transaction is first
    const allTransactions = [...transferTransactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return parseStringify({
      data: account,
      transactions: allTransactions,
    });
  } catch (error) {
    console.error("An error occurred while getting the account:", error);
  }
};